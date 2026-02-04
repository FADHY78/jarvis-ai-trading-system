//+------------------------------------------------------------------+
//|                                              JARVIS_AI_EA.mq5    |
//|                                   Connected to JARVIS AI System  |
//|                                            Auto Trading Bot      |
//+------------------------------------------------------------------+
#property copyright "JARVIS AI Trading System V12.0"
#property link      "https://jarvis-ai-trading-system.vercel.app"
#property version   "12.00"
#property strict

// Input Parameters
input double LotSize = 0.01;              // Lot size per trade
input double RiskPercent = 2.0;           // Risk per trade (%)
input int MagicNumber = 123456;           // Magic number for EA trades
input string API_URL = "https://jarvis-ai-trading-system.vercel.app/api/signals"; // JARVIS API endpoint
input int SignalCheckInterval = 3000;     // Check signals every 3 seconds
input bool EnableAutoTrading = true;      // Enable auto trading
input bool CloseOnSignalChange = true;    // Close position when signal changes
input bool UsePartialTPs = true;          // Use 3 TP levels with partial closes

// Global Variables
string currentSignalPair = "";
string currentSignalDirection = "";
int currentConfidence = 0;
double currentEntry = 0;
double currentTP1 = 0;
double currentTP2 = 0;
double currentTP3 = 0;
double currentSL = 0;
datetime lastSignalCheck = 0;
bool positionOpen = false;
int positionTicket = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("🚀 JARVIS AI Expert Advisor Started!");
   Print("📡 Connected to: ", API_URL);
   Print("💰 Lot Size: ", LotSize);
   Print("⚠️ Risk Per Trade: ", RiskPercent, "%");
   Print("🎯 Auto Trading: ", EnableAutoTrading ? "ENABLED" : "DISABLED");
   
   // Enable WebRequest for localhost
   Print("⚙️ Make sure to add 'https://jarvis-ai-trading-system.vercel.app' to MT5 allowed URLs");
   Print("   Tools → Options → Expert Advisors → Allow WebRequest for listed URL");
   
   EventSetTimer(3); // Check every 3 seconds
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("❌ JARVIS AI Expert Advisor Stopped");
}

//+------------------------------------------------------------------+
//| Timer function - checks signals periodically                     |
//+------------------------------------------------------------------+
void OnTimer()
{
   if(!EnableAutoTrading) return;
   
   // Check for new signals
   if(TimeCurrent() - lastSignalCheck >= SignalCheckInterval/1000)
   {
      CheckAndExecuteSignals();
      lastSignalCheck = TimeCurrent();
   }
   
   // Monitor existing positions
   if(positionOpen)
   {
      MonitorPosition();
   }
}

//+------------------------------------------------------------------+
//| Check signals from JARVIS API and execute trades                |
//+------------------------------------------------------------------+
void CheckAndExecuteSignals()
{
   string headers = "";
   char post[], result[];
   string resultString;
   int timeout = 5000;
   
   Print("🔍 Checking for signals from JARVIS API...");
   
   // Call JARVIS API
   int res = WebRequest("GET", API_URL, headers, timeout, post, result, headers);
   
   if(res == -1)
   {
      int errorCode = GetLastError();
      Print("⚠️ WebRequest Error Code: ", errorCode);
      
      if(errorCode == 4060)
      {
         Print("❌ URL NOT ALLOWED IN MT5!");
         Print("💡 SOLUTION:");
         Print("   1. Open MT5 → Tools → Options → Expert Advisors");
         Print("   2. Check 'Allow WebRequest for listed URL'");
         Print("   3. Add: https://jarvis-ai-trading-system.vercel.app");
         Print("   4. Click OK and restart MT5");
      }
      else if(errorCode == 4014)
      {
         Print("❌ System function not allowed! Enable 'Allow WebRequest' in settings");
      }
      else
      {
         Print("❌ Error connecting to JARVIS API: ", errorCode);
      }
      return;
   }
   
   resultString = CharArrayToString(result);
   Print("📡 API Response (", res, " bytes): ", StringSubstr(resultString, 0, 200));
   
   // Parse JSON response
   if(StringFind(resultString, "\"success\":true") == -1)
   {
      Print("⚠️ No valid signal received from API");
      Print("   Response: ", resultString);
      return;
   }
   
   // Extract signal data (simplified JSON parsing)
   string pair = ExtractValue(resultString, "\"pair\":\"", "\"");
   string direction = ExtractValue(resultString, "\"type\":\"", "\"");
   int confidence = (int)StringToInteger(ExtractValue(resultString, "\"confidence\":", ","));
   double entry = StringToDouble(ExtractValue(resultString, "\"entry\":", ","));
   double tp1 = StringToDouble(ExtractValue(resultString, "\"tp1\":", ","));
   double tp2 = StringToDouble(ExtractValue(resultString, "\"tp2\":", ","));
   double tp3 = StringToDouble(ExtractValue(resultString, "\"tp3\":", ","));
   double sl = StringToDouble(ExtractValue(resultString, "\"sl\":", ","));
   
   Print("📊 Signal Received: ", pair, " ", direction, " ", confidence, "%");
   Print("   Entry: ", entry, " | SL: ", sl);
   Print("   TP1: ", tp1, " | TP2: ", tp2, " | TP3: ", tp3);
   Print("   Position Open: ", positionOpen ? "YES" : "NO");
   Print("   Confidence Check: ", confidence, " >= 85? ", (confidence >= 85 ? "YES" : "NO"));
   
   // Check if signal matches current chart symbol
   string currentSymbol = Symbol();
   if(StringFind(pair, "XAU") == -1 && StringFind(currentSymbol, "XAU") != -1)
   {
      Print("⏸️ Skipping: Signal is for ", pair, " but chart is ", currentSymbol);
      return;
   }
   if(StringFind(pair, "XAU") != -1 && StringFind(currentSymbol, "XAU") == -1)
   {
      Print("⏸️ Skipping: Signal is for ", pair, " but chart is ", currentSymbol);
      return;
   }
   Print("✅ Symbol Match: Signal for ", pair, " matches chart ", currentSymbol);
   
   // Check if signal changed direction
   bool signalChanged = (direction != currentSignalDirection) && (currentSignalDirection != "");
   
   if(signalChanged && CloseOnSignalChange && positionOpen)
   {
      Print("🔄 Signal direction changed! Closing current position...");
      ClosePosition("Signal Direction Changed");
   }
   
   // Open new trade if confidence >= 85%
   if(confidence >= 85 && !positionOpen)
   {
      Print("✅ Conditions met! Opening trade...");
      OpenTrade(pair, direction, entry, tp1, tp2, tp3, sl);
   }
   else if(confidence < 85)
   {
      Print("⏸️ Skipping: Confidence too low (", confidence, "% < 85%)");
   }
   else if(positionOpen)
   {
      Print("⏸️ Skipping: Position already open");
   }
   
   // Update current signal
   currentSignalPair = pair;
   currentSignalDirection = direction;
   currentConfidence = confidence;
   currentEntry = entry;
   currentTP1 = tp1;
   currentTP2 = tp2;
   currentTP3 = tp3;
   currentSL = sl;
}

//+------------------------------------------------------------------+
//| Open a new trade based on JARVIS signal                         |
//+------------------------------------------------------------------+
void OpenTrade(string pair, string direction, double entry, double tp1, double tp2, double tp3, double sl)
{
   // Check if trading is allowed
   if(!TerminalInfoInteger(TERMINAL_TRADE_ALLOWED))
   {
      Print("❌ Trading is disabled in MT5 terminal!");
      Print("💡 Enable AutoTrading: Press Ctrl+E or click AutoTrading button");
      return;
   }
   
   if(!MQLInfoInteger(MQL_TRADE_ALLOWED))
   {
      Print("❌ EA trading is disabled!");
      Print("💡 Check: Tools → Options → Expert Advisors → Allow Algo Trading");
      return;
   }
   
   if(!AccountInfoInteger(ACCOUNT_TRADE_EXPERT))
   {
      Print("❌ Expert Advisors are disabled for this account!");
      return;
   }
   
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   // Get current market prices
   double ask = SymbolInfoDouble(Symbol(), SYMBOL_ASK);
   double bid = SymbolInfoDouble(Symbol(), SYMBOL_BID);
   
   Print("💰 Current Market: ASK=", ask, " BID=", bid);
   Print("🎯 Order Details: ", direction, " ", LotSize, " lots");
   
   // Prepare trade request
   request.action = TRADE_ACTION_DEAL;
   request.symbol = Symbol();
   request.volume = LotSize;
   request.type = (direction == "LONG") ? ORDER_TYPE_BUY : ORDER_TYPE_SELL;
   request.price = (direction == "LONG") ? ask : bid;
   request.sl = sl;
   request.tp = tp3; // Set main TP to TP3
   request.deviation = 50;
   request.magic = MagicNumber;
   request.comment = "JARVIS AI " + direction;
   request.type_filling = ORDER_FILLING_IOC;
   
   Print("📤 Sending order to broker...");
   Print("   Symbol: ", request.symbol);
   Print("   Type: ", (request.type == ORDER_TYPE_BUY ? "BUY" : "SELL"));
   Print("   Volume: ", request.volume);
   Print("   Price: ", request.price);
   Print("   SL: ", request.sl);
   Print("   TP: ", request.tp);
   Print("   Filling Type: ORDER_FILLING_IOC");
   
   // Send order
   if(!OrderSend(request, result))
   {
      int errorCode = GetLastError();
      Print("❌ OrderSend Failed!");
      Print("   Error Code: ", errorCode);
      Print("   Result Code: ", result.retcode);
      Print("   Result Comment: ", result.comment);
      
      if(errorCode == 4756)
      {
         Print("   Error 4756: Failed trade request");
         Print("💡 SOLUTIONS:");
         Print("   1. Check AutoTrading is enabled (Ctrl+E)");
         Print("   2. Check account balance/margin");
         Print("   3. Verify market is open");
         Print("   4. Try smaller lot size");
         Print("   5. Broker may not support ORDER_FILLING_IOC");
         Print("   Current Balance: $", AccountInfoDouble(ACCOUNT_BALANCE));
         Print("   Free Margin: $", AccountInfoDouble(ACCOUNT_MARGIN_FREE));
         Print("   Account Leverage: 1:", AccountInfoInteger(ACCOUNT_LEVERAGE));
         
         // Try with different filling type
         Print("🔄 Retrying with ORDER_FILLING_FOK...");
         request.type_filling = ORDER_FILLING_FOK;
         if(!OrderSend(request, result))
         {
            Print("❌ Still failed with FOK. Trying RETURN...");
            request.type_filling = ORDER_FILLING_RETURN;
            OrderSend(request, result);
         }
      }
      else if(errorCode == 4753)
      {
         Print("   Error 4753: Trade context busy");
         Print("💡 Wait a moment and try again");
      }
      else if(errorCode == 10004)
      {
         Print("   Error 10004: Requote - price changed");
         Print("💡 This is normal, EA will retry on next signal");
      }
      
      return;
   }
   
   if(result.retcode == TRADE_RETCODE_DONE)
   {
      Print("✅ Trade Opened Successfully!");
      Print("   Direction: ", direction);
      Print("   Pair: ", pair);
      Print("   Entry: ", result.price);
      Print("   Volume: ", result.volume);
      Print("   🎯 TP1: ", tp1, " | TP2: ", tp2, " | TP3: ", tp3);
      Print("   🛡️ SL: ", sl);
      Print("   Confidence: ", currentConfidence, "%");
      
      positionOpen = true;
      positionTicket = (int)result.order;
      
      // Send Telegram notification
      SendTelegramNotification("🟢 TRADE OPENED\\n" + 
                              "Pair: " + pair + "\\n" +
                              "Direction: " + direction + "\\n" +
                              "Entry: " + DoubleToString(result.price, 5) + "\\n" +
                              "Confidence: " + IntegerToString(currentConfidence) + "%");
   }
   else
   {
      Print("❌ Order Rejected by Broker!");
      Print("   Return Code: ", result.retcode);
      Print("   Comment: ", result.comment);
      
      if(result.retcode == 10006)
         Print("💡 Requote - price moved, will retry on next signal");
      else if(result.retcode == 10013)
         Print("💡 Invalid request - check order parameters");
      else if(result.retcode == 10014)
         Print("💡 Invalid volume - check lot size settings");
      else if(result.retcode == 10016)
         Print("💡 Market is closed");
      else if(result.retcode == 10019)
         Print("💡 Insufficient funds - reduce lot size");
   }
}

//+------------------------------------------------------------------+
//| Monitor open position and manage TPs                            |
//+------------------------------------------------------------------+
void MonitorPosition()
{
   if(!PositionSelectByTicket(positionTicket))
   {
      positionOpen = false;
      return;
   }
   
   double currentPrice = (currentSignalDirection == "LONG") ? 
                         SymbolInfoDouble(Symbol(), SYMBOL_BID) : 
                         SymbolInfoDouble(Symbol(), SYMBOL_ASK);
   
   double positionVolume = PositionGetDouble(POSITION_VOLUME);
   
   // Check TP levels if using partial TPs
   if(UsePartialTPs)
   {
      // TP1 hit - close 30%
      if((currentSignalDirection == "LONG" && currentPrice >= currentTP1) ||
         (currentSignalDirection == "SHORT" && currentPrice <= currentTP1))
      {
         if(positionVolume >= LotSize)
         {
            ClosePartialPosition(0.3, "TP1 Hit (1:1.5 R:R)");
         }
      }
      
      // TP2 hit - close 40%
      if((currentSignalDirection == "LONG" && currentPrice >= currentTP2) ||
         (currentSignalDirection == "SHORT" && currentPrice <= currentTP2))
      {
         if(positionVolume >= LotSize * 0.7)
         {
            ClosePartialPosition(0.4, "TP2 Hit (1:2.5 R:R)");
         }
      }
      
      // TP3 hit - close remaining
      if((currentSignalDirection == "LONG" && currentPrice >= currentTP3) ||
         (currentSignalDirection == "SHORT" && currentPrice <= currentTP3))
      {
         ClosePosition("TP3 Hit (1:4.0 R:R)");
      }
   }
}

//+------------------------------------------------------------------+
//| Close partial position                                           |
//+------------------------------------------------------------------+
void ClosePartialPosition(double percentage, string reason)
{
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   double volumeToClose = PositionGetDouble(POSITION_VOLUME) * percentage;
   volumeToClose = NormalizeDouble(volumeToClose, 2);
   
   request.action = TRADE_ACTION_DEAL;
   request.position = positionTicket;
   request.symbol = Symbol();
   request.volume = volumeToClose;
   request.type = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? ORDER_TYPE_SELL : ORDER_TYPE_BUY;
   request.price = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? 
                   SymbolInfoDouble(Symbol(), SYMBOL_BID) : 
                   SymbolInfoDouble(Symbol(), SYMBOL_ASK);
   request.magic = MagicNumber;
   request.comment = reason;
   
   if(OrderSend(request, result))
   {
      Print("✅ Partial Close: ", percentage*100, "% - ", reason);
      SendTelegramNotification("🎯 " + reason + "\\nClosed " + DoubleToString(percentage*100, 0) + "% of position");
   }
}

//+------------------------------------------------------------------+
//| Close entire position                                            |
//+------------------------------------------------------------------+
void ClosePosition(string reason)
{
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   request.action = TRADE_ACTION_DEAL;
   request.position = positionTicket;
   request.symbol = Symbol();
   request.volume = PositionGetDouble(POSITION_VOLUME);
   request.type = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? ORDER_TYPE_SELL : ORDER_TYPE_BUY;
   request.price = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY) ? 
                   SymbolInfoDouble(Symbol(), SYMBOL_BID) : 
                   SymbolInfoDouble(Symbol(), SYMBOL_ASK);
   request.magic = MagicNumber;
   request.comment = reason;
   
   if(OrderSend(request, result))
   {
      double profit = PositionGetDouble(POSITION_PROFIT);
      Print("❌ Position Closed: ", reason);
      Print("   💰 Profit: $", profit);
      
      SendTelegramNotification("❌ POSITION CLOSED\\n" +
                              "Reason: " + reason + "\\n" +
                              "Profit: $" + DoubleToString(profit, 2));
      
      positionOpen = false;
      positionTicket = 0;
   }
}

//+------------------------------------------------------------------+
//| Send Telegram notification                                       |
//+------------------------------------------------------------------+
void SendTelegramNotification(string message)
{
   string url = "https://jarvis-ai-trading-system.vercel.app/api/telegram/sendAlert";
   string headers = "Content-Type: application/json\r\n";
   char post[], result[];
   string postData = "{\"title\":\"MT5 EA Alert\",\"message\":\"" + message + "\"}";
   
   StringToCharArray(postData, post, 0, StringLen(postData));
   
   WebRequest("POST", url, headers, 5000, post, result, headers);
}

//+------------------------------------------------------------------+
//| Extract value from JSON string (simple parser)                  |
//+------------------------------------------------------------------+
string ExtractValue(string json, string key, string delimiter)
{
   int start = StringFind(json, key);
   if(start == -1) return "";
   
   start += StringLen(key);
   int end = StringFind(json, delimiter, start);
   if(end == -1) end = StringLen(json);
   
   return StringSubstr(json, start, end - start);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // Main trading logic runs on Timer, not every tick
}
//+------------------------------------------------------------------+
