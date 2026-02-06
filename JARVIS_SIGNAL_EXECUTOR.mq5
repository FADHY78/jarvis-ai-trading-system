//+------------------------------------------------------------------+
//|                                    JARVIS_SIGNAL_EXECUTOR.mq5   |
//|              JARVIS AI SIGNAL EXECUTOR - ULTRA FAST EDITION     |
//|                Connects to JARVIS Web System for Live Signals   |
//+------------------------------------------------------------------+
#property copyright "JARVIS AI Trading System V12.0 - SIGNAL EXECUTOR"
#property link      "https://jarvis-ai-trading-system.vercel.app"
#property version   "12.00"
#property strict

// ============== SERVER CONNECTION ==============
input string SignalServerURL = "https://jarvis-ai-trading-system.vercel.app/api/signals";  // JARVIS Signal API URL (LIVE)
input int    PollIntervalMS = 500;                                   // Poll interval (milliseconds)
input bool   EnableWebRequest = true;                                // Enable web requests

// ============== TRADING SETTINGS ==============
input double LotSize_XAUUSD = 0.05;       // Lot size for XAUUSD
input double LotSize_EURUSD = 0.10;       // Lot size for EURUSD
input int    MagicNumber = 888999;        // Magic number for trades
input bool   EnableAutoTrading = true;    // Enable auto trading
input int    MaxSpread_XAUUSD = 35;       // Max spread XAUUSD (points)
input int    MaxSpread_EURUSD = 15;       // Max spread EURUSD (points)

// ============== FAST EXIT SETTINGS ==============
input bool   EnableFastExit = true;       // Exit when signal reverses
input bool   EnableQuickProfit = true;    // Take quick profits
input int    QuickProfitXAU = 150;        // Quick profit XAUUSD (points)
input int    QuickProfitEUR = 80;         // Quick profit EURUSD (points)
input int    MinProfitToExit = 30;        // Minimum profit to exit on reversal (points)

// ============== TRAILING STOP ==============
input bool   UseTrailingStop = true;      // Enable trailing stop
input int    TrailingStart_XAU = 100;     // Start trailing XAUUSD (points)
input int    TrailingStep_XAU = 50;       // Trail step XAUUSD (points)
input int    TrailingStart_EUR = 50;      // Start trailing EURUSD (points)
input int    TrailingStep_EUR = 25;       // Trail step EURUSD (points)

// ============== RISK MANAGEMENT ==============
input int    DefaultSL_XAU = 300;         // Default SL XAUUSD (points)
input int    DefaultSL_EUR = 150;         // Default SL EURUSD (points)
input double MaxDailyLoss = 500.0;        // Max daily loss ($)
input int    MaxPositions = 5;            // Max simultaneous positions
input int    MaxPositionsPerSymbol = 3;   // Max positions per symbol (trend stacking)
input bool   EnableTrendStacking = true;  // Allow multiple positions in same direction
input int    MinPipsBetweenTrades = 50;   // Min distance between entries (points)

// ============== CONFIDENCE FILTER ==============
input int    MinConfidence = 75;          // Minimum signal confidence (%)
input bool   OnlyHighConfidence = false;  // Only trade 90%+ signals

// Global Variables
datetime lastPollTime = 0;
datetime lastSignalTime = 0;
string lastSignalType = "";
string lastSignalPair = "";
int totalTrades = 0;
double dailyPnL = 0;
datetime lastDayReset = 0;

// Current signal cache
string currentSignalPair = "";
string currentSignalType = "";
int currentConfidence = 0;
double currentEntry = 0;
double currentSL = 0;
double currentTP1 = 0;
double currentTP2 = 0;
double currentTP3 = 0;

// Position tracking
struct PositionInfo {
   ulong ticket;
   string symbol;
   long type;
   double openPrice;
   double sl;
   double tp;
   bool trailingActive;
   bool tp1Hit;
   bool tp2Hit;
};

PositionInfo activePositions[10];
int positionCount = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("═══════════════════════════════════════════════════════════");
   Print("🚀 JARVIS SIGNAL EXECUTOR - ULTRA FAST EDITION");
   Print("═══════════════════════════════════════════════════════════");
   Print("📡 Signal Server: ", SignalServerURL);
   Print("⚡ Poll Interval: ", PollIntervalMS, "ms");
   Print("💰 XAUUSD Lot: ", LotSize_XAUUSD, " | EURUSD Lot: ", LotSize_EURUSD);
   Print("🎯 Min Confidence: ", MinConfidence, "%");
   Print("═══════════════════════════════════════════════════════════");
   
   // Check if WebRequest is allowed
   if(EnableWebRequest)
   {
      Print("⚠️ IMPORTANT: Add this URL to MT5 WebRequest allowed list:");
      Print("   Tools > Options > Expert Advisors > Allow WebRequest for listed URL");
      Print("   URL: https://jarvis-ai-trading-system.vercel.app");
   }
   
   // Set timer for polling
   EventSetMillisecondTimer(PollIntervalMS);
   
   // Reset daily stats
   ResetDailyStats();
   
   // Load existing positions
   LoadActivePositions();
   
   Print("✅ JARVIS Signal Executor Ready!");
   Print("═══════════════════════════════════════════════════════════");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   Print("❌ JARVIS Signal Executor Stopped - Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Timer function - Fast polling                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   if(!EnableAutoTrading) return;
   
   // Reset daily stats at midnight
   CheckDailyReset();
   
   // Check daily loss limit
   if(dailyPnL <= -MaxDailyLoss)
   {
      Print("🛑 DAILY LOSS LIMIT REACHED: $", MathAbs(dailyPnL));
      return;
   }
   
   // Poll signal server
   PollSignalServer();
   
   // Manage active positions
   ManageAllPositions();
}

//+------------------------------------------------------------------+
//| Tick function                                                   |
//+------------------------------------------------------------------+
void OnTick()
{
   // Fast position management on every tick
   if(positionCount > 0)
   {
      ManageAllPositions();
   }
}

//+------------------------------------------------------------------+
//| Poll the JARVIS signal server                                   |
//+------------------------------------------------------------------+
void PollSignalServer()
{
   if(!EnableWebRequest) return;
   
   string headers = "Content-Type: application/json\r\n";
   char post[];
   char result[];
   string resultHeaders;
   
   int timeout = 2000; // 2 second timeout
   
   int res = WebRequest(
      "GET",
      SignalServerURL,
      headers,
      timeout,
      post,
      result,
      resultHeaders
   );
   
   if(res == -1)
   {
      int error = GetLastError();
      if(error == 4060)
      {
         Print("❌ WebRequest not allowed! Add URL to MT5 settings:");
         Print("   Tools > Options > Expert Advisors > Allow WebRequest");
         Print("   Add: https://jarvis-ai-trading-system.vercel.app");
      }
      return;
   }
   
   // Parse JSON response
   string jsonResponse = CharArrayToString(result);
   
   if(StringFind(jsonResponse, "\"success\":true") >= 0)
   {
      ParseAndProcessSignal(jsonResponse);
   }
}

//+------------------------------------------------------------------+
//| Parse JSON signal and process                                   |
//+------------------------------------------------------------------+
void ParseAndProcessSignal(string json)
{
   // Extract signal data from JSON
   string pair = ExtractJsonString(json, "pair");
   string signalType = ExtractJsonString(json, "type");
   int confidence = (int)ExtractJsonDouble(json, "confidence");
   double entry = ExtractJsonDouble(json, "entry");
   double sl = ExtractJsonDouble(json, "sl");
   double tp1 = ExtractJsonDouble(json, "tp1");
   double tp2 = ExtractJsonDouble(json, "tp2");
   double tp3 = ExtractJsonDouble(json, "tp3");
   string timestamp = ExtractJsonString(json, "timestamp");
   
   // Check if this is a new signal
   bool isNewSignal = (pair != lastSignalPair || signalType != lastSignalType);
   
   if(!isNewSignal) return;
   
   // Update cache
   currentSignalPair = pair;
   currentSignalType = signalType;
   currentConfidence = confidence;
   currentEntry = entry;
   currentSL = sl;
   currentTP1 = tp1;
   currentTP2 = tp2;
   currentTP3 = tp3;
   
   Print("═══════════════════════════════════════════════════════════");
   Print("📡 NEW SIGNAL RECEIVED!");
   Print("   Pair: ", pair, " | Type: ", signalType);
   Print("   Confidence: ", confidence, "%");
   Print("   Entry: ", entry, " | SL: ", sl);
   Print("   TP1: ", tp1, " | TP2: ", tp2, " | TP3: ", tp3);
   Print("═══════════════════════════════════════════════════════════");
   
   // Check signal reversal - close opposite positions
   if(EnableFastExit && lastSignalType != "" && signalType != lastSignalType)
   {
      Print("🔄 SIGNAL REVERSAL DETECTED! Checking positions to close...");
      CloseOppositePositions(NormalizePair(pair), signalType);
   }
   
   // Update last signal
   lastSignalPair = pair;
   lastSignalType = signalType;
   lastSignalTime = TimeCurrent();
   
   // Validate and execute
   if(ValidateSignal(pair, signalType, confidence))
   {
      ExecuteSignal(pair, signalType, confidence, entry, sl, tp1, tp2, tp3);
   }
}

//+------------------------------------------------------------------+
//| Validate signal before execution                                |
//+------------------------------------------------------------------+
bool ValidateSignal(string pair, string signalType, int confidence)
{
   // Check confidence threshold
   if(confidence < MinConfidence)
   {
      Print("⏸️ Signal confidence too low: ", confidence, "% (need ", MinConfidence, "%)");
      return false;
   }
   
   if(OnlyHighConfidence && confidence < 90)
   {
      Print("⏸️ High confidence mode: ", confidence, "% (need 90%)");
      return false;
   }
   
   // Check if we already have max positions
   if(positionCount >= MaxPositions)
   {
      Print("⏸️ Max positions reached: ", positionCount);
      return false;
   }
   
   // Normalize and validate symbol
   string symbol = NormalizePair(pair);
   if(!ValidateSymbol(symbol))
   {
      Print("⏸️ Invalid or unavailable symbol: ", symbol);
      return false;
   }
   
   // Count positions for this symbol and check trend stacking
   int symbolPositions = 0;
   double lastEntryPrice = 0;
   bool sameDirection = true;
   
   for(int i = 0; i < positionCount; i++)
   {
      if(activePositions[i].symbol == symbol || 
         StringFind(activePositions[i].symbol, StringSubstr(symbol, 0, 3)) >= 0)
      {
         symbolPositions++;
         lastEntryPrice = activePositions[i].openPrice;
         
         // Check if existing position is same direction
         bool existingIsLong = (activePositions[i].type == POSITION_TYPE_BUY);
         bool newIsLong = (signalType == "LONG");
         if(existingIsLong != newIsLong)
            sameDirection = false;
      }
   }
   
   // If we have positions for this symbol
   if(symbolPositions > 0)
   {
      // Check max positions per symbol
      if(symbolPositions >= MaxPositionsPerSymbol)
      {
         Print("⏸️ Max positions for ", symbol, " reached: ", symbolPositions);
         return false;
      }
      
      // Only allow stacking in same direction (trend following)
      if(!EnableTrendStacking || !sameDirection)
      {
         Print("⏸️ Already have opposite position for ", symbol);
         return false;
      }
      
      // Check minimum distance between entries
      double currentPrice = (signalType == "LONG") ? 
                           SymbolInfoDouble(symbol, SYMBOL_ASK) :
                           SymbolInfoDouble(symbol, SYMBOL_BID);
      double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
      double distance = MathAbs(currentPrice - lastEntryPrice) / point;
      
      if(distance < MinPipsBetweenTrades)
      {
         Print("⏸️ Too close to last entry: ", distance, " pts (need ", MinPipsBetweenTrades, ")");
         return false;
      }
      
      Print("📈 TREND STACKING: Adding position #", symbolPositions + 1, " for ", symbol);
   }
   
   // Check spread
   double spread = SymbolInfoInteger(symbol, SYMBOL_SPREAD);
   int maxSpread = (StringFind(symbol, "XAU") >= 0) ? MaxSpread_XAUUSD : MaxSpread_EURUSD;
   
   if(spread > maxSpread)
   {
      Print("⏸️ Spread too high: ", spread, " > ", maxSpread);
      return false;
   }
   
   return true;
}

//+------------------------------------------------------------------+
//| Execute the trading signal                                      |
//+------------------------------------------------------------------+
void ExecuteSignal(string pair, string signalType, int confidence, 
                   double entry, double sl, double tp1, double tp2, double tp3)
{
   string symbol = NormalizePair(pair);
   
   // Validate symbol before trading
   if(!ValidateSymbol(symbol))
   {
      Print("❌ Cannot trade - invalid symbol: ", symbol);
      return;
   }
   
   // Ensure symbol is in Market Watch
   if(!SymbolInfoInteger(symbol, SYMBOL_VISIBLE))
      SymbolSelect(symbol, true);
   
   // Wait for symbol data to be ready
   int retries = 0;
   while(SymbolInfoDouble(symbol, SYMBOL_BID) <= 0 && retries < 10)
   {
      Sleep(100);
      retries++;
   }
   
   // Get symbol info
   double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   double ask = SymbolInfoDouble(symbol, SYMBOL_ASK);
   double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
   
   if(ask <= 0 || bid <= 0 || point <= 0)
   {
      Print("❌ Invalid symbol data for ", symbol, " - Ask: ", ask, " Bid: ", bid);
      return;
   }
   
   // Determine lot size based on symbol
   double lotSize = (StringFind(symbol, "XAU") >= 0) ? LotSize_XAUUSD : LotSize_EURUSD;
   int defaultSL = (StringFind(symbol, "XAU") >= 0) ? DefaultSL_XAU : DefaultSL_EUR;
   
   // Validate and adjust lot size
   double minLot = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(symbol, SYMBOL_VOLUME_STEP);
   
   if(lotSize < minLot) lotSize = minLot;
   if(lotSize > maxLot) lotSize = maxLot;
   lotSize = MathFloor(lotSize / lotStep) * lotStep;
   
   // Get broker minimum stop distance
   int stopLevel = (int)SymbolInfoInteger(symbol, SYMBOL_TRADE_STOPS_LEVEL);
   int freezeLevel = (int)SymbolInfoInteger(symbol, SYMBOL_TRADE_FREEZE_LEVEL);
   int minStopDistance = MathMax(stopLevel, freezeLevel);
   if(minStopDistance < 20) minStopDistance = 20; // Safety buffer
   
   // Ensure default SL is at least minimum distance
   if(defaultSL < minStopDistance + 10)
      defaultSL = minStopDistance + 10;
   
   // Calculate prices
   double entryPrice, slPrice, tpPrice;
   ENUM_ORDER_TYPE orderType;
   
   if(signalType == "LONG")
   {
      orderType = ORDER_TYPE_BUY;
      entryPrice = ask;
      
      // Use signal SL or default, ensuring minimum distance
      if(sl > 0 && sl < entryPrice)
      {
         double slDist = (entryPrice - sl) / point;
         if(slDist >= minStopDistance)
            slPrice = sl;
         else
            slPrice = NormalizeDouble(entryPrice - defaultSL * point, digits);
      }
      else
         slPrice = NormalizeDouble(entryPrice - defaultSL * point, digits);
      
      // Use TP2 as main target, ensuring minimum distance
      if(tp2 > 0 && tp2 > entryPrice)
      {
         double tpDist = (tp2 - entryPrice) / point;
         if(tpDist >= minStopDistance)
            tpPrice = tp2;
         else
            tpPrice = NormalizeDouble(entryPrice + (defaultSL * 2.5) * point, digits);
      }
      else
         tpPrice = NormalizeDouble(entryPrice + (defaultSL * 2.5) * point, digits);
   }
   else // SHORT
   {
      orderType = ORDER_TYPE_SELL;
      entryPrice = bid;
      
      if(sl > 0 && sl > entryPrice)
      {
         double slDist = (sl - entryPrice) / point;
         if(slDist >= minStopDistance)
            slPrice = sl;
         else
            slPrice = NormalizeDouble(entryPrice + defaultSL * point, digits);
      }
      else
         slPrice = NormalizeDouble(entryPrice + defaultSL * point, digits);
      
      if(tp2 > 0 && tp2 < entryPrice)
      {
         double tpDist = (entryPrice - tp2) / point;
         if(tpDist >= minStopDistance)
            tpPrice = tp2;
         else
            tpPrice = NormalizeDouble(entryPrice - (defaultSL * 2.5) * point, digits);
      }
      else
         tpPrice = NormalizeDouble(entryPrice - (defaultSL * 2.5) * point, digits);
   }
   
   Print("📊 Broker min stop distance: ", minStopDistance, " points");
   
   // Prepare trade request
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   // Auto-detect filling mode
   int filling_mode = (int)SymbolInfoInteger(symbol, SYMBOL_FILLING_MODE);
   ENUM_ORDER_TYPE_FILLING type_filling = ORDER_FILLING_FOK;
   if((filling_mode & 2) == 2)
      type_filling = ORDER_FILLING_IOC;
   else if(filling_mode == 0)
      type_filling = ORDER_FILLING_RETURN;
   
   request.action = TRADE_ACTION_DEAL;
   request.symbol = symbol;
   request.volume = lotSize;
   request.type = orderType;
   request.price = entryPrice;
   request.sl = slPrice;
   request.tp = tpPrice;
   request.deviation = 30;
   request.magic = MagicNumber;
   request.comment = "JARVIS " + signalType + " " + IntegerToString(confidence) + "%";
   request.type_filling = type_filling;
   
   Print("⚡ EXECUTING SIGNAL TRADE:");
   Print("   ", symbol, " ", signalType, " @ ", entryPrice);
   Print("   SL: ", slPrice, " | TP: ", tpPrice);
   Print("   Confidence: ", confidence, "%");
   
   // Send order
   bool sent = OrderSend(request, result);
   
   if(sent && result.retcode == TRADE_RETCODE_DONE)
   {
      Print("═══════════════════════════════════════════════════════════");
      Print("✅ TRADE EXECUTED SUCCESSFULLY!");
      Print("   Order #", result.order, " | ", symbol, " ", signalType);
      Print("   Entry: ", entryPrice, " | SL: ", slPrice, " | TP: ", tpPrice);
      Print("═══════════════════════════════════════════════════════════");
      
      // Add to tracking
      AddActivePosition(result.order, symbol, (long)orderType, entryPrice, slPrice, tpPrice);
      
      totalTrades++;
   }
   else
   {
      Print("❌ Trade failed: ", result.comment, " (", result.retcode, ")");
      HandleTradeError(result.retcode, symbol, signalType);
   }
}

//+------------------------------------------------------------------+
//| Handle trade errors and retry if possible                       |
//+------------------------------------------------------------------+
void HandleTradeError(uint retcode, string symbol, string direction)
{
   switch(retcode)
   {
      case 10013: // Invalid request
         Print("⚠️ Invalid request - check symbol/volume/prices");
         Print("   Symbol: ", symbol, " | Direction: ", direction);
         Print("   Verify symbol exists in Market Watch");
         break;
      case 10015: // Invalid price
         Print("⚠️ Invalid price - market may have moved");
         break;
      case 10016: // Invalid stops
         {
            int stopLevel = (int)SymbolInfoInteger(symbol, SYMBOL_TRADE_STOPS_LEVEL);
            Print("⚠️ Invalid stops - min distance: ", stopLevel, " points");
         }
         break;
      case 10017: // Trade disabled
         Print("⚠️ Trading disabled for ", symbol);
         break;
      case 10018: // Market closed
         Print("⚠️ Market closed for ", symbol);
         break;
      case 10019: // Not enough money
         Print("⚠️ Not enough margin!");
         break;
      case 10030: // Invalid filling
         Print("⚠️ Invalid filling mode - broker rejected");
         break;
      case 10014: // Invalid volume
         {
            double minLot = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN);
            double maxLot = SymbolInfoDouble(symbol, SYMBOL_VOLUME_MAX);
            Print("⚠️ Invalid volume - Min: ", minLot, " Max: ", maxLot);
         }
         break;
      case 10006: // Requote
         Print("⚠️ Requote - price changed during request");
         break;
      default:
         Print("⚠️ Error code: ", retcode, " - ", GetErrorDescription(retcode));
   }
}

//+------------------------------------------------------------------+
//| Get error description                                           |
//+------------------------------------------------------------------+
string GetErrorDescription(uint code)
{
   switch(code)
   {
      case 10004: return "Requote";
      case 10006: return "Request rejected";
      case 10007: return "Request canceled";
      case 10010: return "Only partial filled";
      case 10011: return "Trade error";
      case 10012: return "Request timeout";
      case 10013: return "Invalid request";
      case 10014: return "Invalid volume";
      case 10015: return "Invalid price";
      case 10016: return "Invalid stops";
      case 10017: return "Trade disabled";
      case 10018: return "Market closed";
      case 10019: return "Insufficient funds";
      case 10020: return "Prices changed";
      case 10021: return "No quotes";
      case 10022: return "Invalid expiration";
      case 10023: return "Order state changed";
      case 10024: return "Too many requests";
      case 10025: return "No changes";
      case 10026: return "Autotrading disabled";
      case 10027: return "Autotrading disabled by client";
      case 10028: return "Request locked";
      case 10029: return "Long only";
      case 10030: return "Short only";
      case 10031: return "Close only";
      case 10032: return "FIFO close required";
      default: return "Unknown error";
   }
}

//+------------------------------------------------------------------+
//| Close opposite positions on signal reversal                     |
//+------------------------------------------------------------------+
void CloseOppositePositions(string symbol, string newSignalType)
{
   for(int i = positionCount - 1; i >= 0; i--)
   {
      if(activePositions[i].symbol != symbol) continue;
      
      // Check if position is opposite to new signal
      bool isLong = (activePositions[i].type == POSITION_TYPE_BUY);
      bool shouldClose = (newSignalType == "LONG" && !isLong) || 
                         (newSignalType == "SHORT" && isLong);
      
      if(!shouldClose) continue;
      
      // Check profit before closing
      if(!PositionSelectByTicket(activePositions[i].ticket)) continue;
      
      double profit = PositionGetDouble(POSITION_PROFIT);
      double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      double currentPrice = isLong ? 
                           SymbolInfoDouble(symbol, SYMBOL_BID) :
                           SymbolInfoDouble(symbol, SYMBOL_ASK);
      
      double profitPoints = isLong ? 
                           (currentPrice - openPrice) / point :
                           (openPrice - currentPrice) / point;
      
      // Only close if in profit or breakeven
      if(profitPoints >= -MinProfitToExit)
      {
         Print("🔄 CLOSING ON REVERSAL: ", symbol, " ", (isLong ? "LONG" : "SHORT"));
         Print("   Profit Points: ", profitPoints, " | Profit: $", profit);
         
         ClosePosition(activePositions[i].ticket);
         RemoveActivePosition(i);
      }
      else
      {
         Print("⏸️ Keeping position - loss too large: ", profitPoints, " pts");
      }
   }
}

//+------------------------------------------------------------------+
//| Manage all active positions                                     |
//+------------------------------------------------------------------+
void ManageAllPositions()
{
   for(int i = positionCount - 1; i >= 0; i--)
   {
      if(!PositionSelectByTicket(activePositions[i].ticket))
      {
         // Position closed externally
         double profit = 0; // Can't get profit of closed position
         Print("📊 Position closed: #", activePositions[i].ticket);
         RemoveActivePosition(i);
         continue;
      }
      
      ManagePosition(i);
   }
}

//+------------------------------------------------------------------+
//| Manage individual position                                      |
//+------------------------------------------------------------------+
void ManagePosition(int index)
{
   string symbol = activePositions[index].symbol;
   ulong ticket = activePositions[index].ticket;
   
   double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   
   double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
   double currentSL = PositionGetDouble(POSITION_SL);
   double currentTP = PositionGetDouble(POSITION_TP);
   long posType = PositionGetInteger(POSITION_TYPE);
   double profit = PositionGetDouble(POSITION_PROFIT);
   
   bool isLong = (posType == POSITION_TYPE_BUY);
   double currentPrice = isLong ? 
                        SymbolInfoDouble(symbol, SYMBOL_BID) :
                        SymbolInfoDouble(symbol, SYMBOL_ASK);
   
   double profitPoints = isLong ? 
                        (currentPrice - openPrice) / point :
                        (openPrice - currentPrice) / point;
   
   // Get symbol-specific settings
   int quickProfit = (symbol == "XAUUSD") ? QuickProfitXAU : QuickProfitEUR;
   int trailStart = (symbol == "XAUUSD") ? TrailingStart_XAU : TrailingStart_EUR;
   int trailStep = (symbol == "XAUUSD") ? TrailingStep_XAU : TrailingStep_EUR;
   
   // Quick profit exit
   if(EnableQuickProfit && profitPoints >= quickProfit)
   {
      Print("💰 QUICK PROFIT EXIT: ", symbol, " +", profitPoints, " pts ($", profit, ")");
      ClosePosition(ticket);
      dailyPnL += profit;
      RemoveActivePosition(index);
      return;
   }
   
   // Trailing stop
   if(UseTrailingStop && profitPoints >= trailStart)
   {
      // Get broker minimum stop distance
      int stopLevel = (int)SymbolInfoInteger(symbol, SYMBOL_TRADE_STOPS_LEVEL);
      if(stopLevel < 20) stopLevel = 20;
      
      int effectiveTrail = MathMax(trailStep, stopLevel);
      
      double newSL;
      
      if(isLong)
      {
         newSL = NormalizeDouble(currentPrice - effectiveTrail * point, digits);
         if(newSL > currentSL)
         {
            ModifyPosition(ticket, newSL, currentTP);
            if(!activePositions[index].trailingActive)
            {
               Print("📈 TRAILING ACTIVATED: ", symbol, " @ ", profitPoints, " pts");
               activePositions[index].trailingActive = true;
            }
         }
      }
      else
      {
         newSL = NormalizeDouble(currentPrice + effectiveTrail * point, digits);
         if(newSL < currentSL || currentSL == 0)
         {
            ModifyPosition(ticket, newSL, currentTP);
            if(!activePositions[index].trailingActive)
            {
               Print("📉 TRAILING ACTIVATED: ", symbol, " @ ", profitPoints, " pts");
               activePositions[index].trailingActive = true;
            }
         }
      }
   }
}

//+------------------------------------------------------------------+
//| Close position                                                  |
//+------------------------------------------------------------------+
void ClosePosition(ulong ticket)
{
   if(!PositionSelectByTicket(ticket)) return;
   
   string symbol = PositionGetString(POSITION_SYMBOL);
   long type = PositionGetInteger(POSITION_TYPE);
   double volume = PositionGetDouble(POSITION_VOLUME);
   
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   // Auto-detect filling mode
   int filling_mode = (int)SymbolInfoInteger(symbol, SYMBOL_FILLING_MODE);
   ENUM_ORDER_TYPE_FILLING type_filling = ORDER_FILLING_FOK;
   if((filling_mode & 2) == 2)
      type_filling = ORDER_FILLING_IOC;
   else if(filling_mode == 0)
      type_filling = ORDER_FILLING_RETURN;
   
   request.action = TRADE_ACTION_DEAL;
   request.symbol = symbol;
   request.volume = volume;
   request.type = (type == POSITION_TYPE_BUY) ? ORDER_TYPE_SELL : ORDER_TYPE_BUY;
   request.price = (type == POSITION_TYPE_BUY) ? 
                   SymbolInfoDouble(symbol, SYMBOL_BID) :
                   SymbolInfoDouble(symbol, SYMBOL_ASK);
   request.deviation = 50;
   request.magic = MagicNumber;
   request.position = ticket;
   request.type_filling = type_filling;
   
   if(!OrderSend(request, result))
   {
      Print("❌ Failed to close position: ", result.comment);
   }
   else
   {
      Print("✅ Position closed: #", ticket);
   }
}

//+------------------------------------------------------------------+
//| Modify position SL/TP                                           |
//+------------------------------------------------------------------+
void ModifyPosition(ulong ticket, double newSL, double newTP)
{
   if(!PositionSelectByTicket(ticket)) return;
   
   string symbol = PositionGetString(POSITION_SYMBOL);
   long posType = PositionGetInteger(POSITION_TYPE);
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
   
   // Get minimum stop distance from broker
   int stopLevel = (int)SymbolInfoInteger(symbol, SYMBOL_TRADE_STOPS_LEVEL);
   int freezeLevel = (int)SymbolInfoInteger(symbol, SYMBOL_TRADE_FREEZE_LEVEL);
   int minDistance = MathMax(stopLevel, freezeLevel);
   if(minDistance < 10) minDistance = 10; // Safety minimum
   
   double currentPrice = (posType == POSITION_TYPE_BUY) ? 
                        SymbolInfoDouble(symbol, SYMBOL_BID) :
                        SymbolInfoDouble(symbol, SYMBOL_ASK);
   
   // Validate SL distance
   double slDistance = MathAbs(currentPrice - newSL) / point;
   if(slDistance < minDistance)
   {
      // Adjust SL to minimum distance
      if(posType == POSITION_TYPE_BUY)
         newSL = NormalizeDouble(currentPrice - (minDistance + 5) * point, digits);
      else
         newSL = NormalizeDouble(currentPrice + (minDistance + 5) * point, digits);
      
      slDistance = MathAbs(currentPrice - newSL) / point;
   }
   
   // Validate TP distance if set
   if(newTP > 0)
   {
      double tpDistance = MathAbs(currentPrice - newTP) / point;
      if(tpDistance < minDistance)
      {
         // Adjust TP to minimum distance
         if(posType == POSITION_TYPE_BUY)
            newTP = NormalizeDouble(currentPrice + (minDistance + 5) * point, digits);
         else
            newTP = NormalizeDouble(currentPrice - (minDistance + 5) * point, digits);
      }
   }
   
   // Normalize values
   newSL = NormalizeDouble(newSL, digits);
   newTP = NormalizeDouble(newTP, digits);
   
   // Check if SL is on correct side of price
   if(posType == POSITION_TYPE_BUY && newSL >= currentPrice)
   {
      Print("⚠️ Invalid SL for BUY: SL ", newSL, " >= Price ", currentPrice);
      return;
   }
   if(posType == POSITION_TYPE_SELL && newSL <= currentPrice)
   {
      Print("⚠️ Invalid SL for SELL: SL ", newSL, " <= Price ", currentPrice);
      return;
   }
   
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   request.action = TRADE_ACTION_SLTP;
   request.position = ticket;
   request.symbol = symbol;
   request.sl = newSL;
   request.tp = newTP;
   
   if(!OrderSend(request, result))
   {
      if(result.retcode != 10025) // Ignore "no changes" error
         Print("⚠️ Failed to modify SL: ", result.comment, " (code: ", result.retcode, ")");
   }
}

//+------------------------------------------------------------------+
//| Add position to tracking array                                  |
//+------------------------------------------------------------------+
void AddActivePosition(ulong ticket, string symbol, long type, 
                       double openPrice, double sl, double tp)
{
   if(positionCount >= 10) return;
   
   activePositions[positionCount].ticket = ticket;
   activePositions[positionCount].symbol = symbol;
   activePositions[positionCount].type = type;
   activePositions[positionCount].openPrice = openPrice;
   activePositions[positionCount].sl = sl;
   activePositions[positionCount].tp = tp;
   activePositions[positionCount].trailingActive = false;
   activePositions[positionCount].tp1Hit = false;
   activePositions[positionCount].tp2Hit = false;
   positionCount++;
}

//+------------------------------------------------------------------+
//| Remove position from tracking array                             |
//+------------------------------------------------------------------+
void RemoveActivePosition(int index)
{
   for(int i = index; i < positionCount - 1; i++)
   {
      activePositions[i] = activePositions[i + 1];
   }
   positionCount--;
}

//+------------------------------------------------------------------+
//| Load existing positions on startup                              |
//+------------------------------------------------------------------+
void LoadActivePositions()
{
   positionCount = 0;
   
   for(int i = 0; i < PositionsTotal(); i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      if(PositionGetInteger(POSITION_MAGIC) != MagicNumber) continue;
      
      string symbol = PositionGetString(POSITION_SYMBOL);
      if(symbol != "XAUUSD" && symbol != "EURUSD") continue;
      
      AddActivePosition(
         ticket,
         symbol,
         PositionGetInteger(POSITION_TYPE),
         PositionGetDouble(POSITION_PRICE_OPEN),
         PositionGetDouble(POSITION_SL),
         PositionGetDouble(POSITION_TP)
      );
      
      Print("📂 Loaded position: #", ticket, " ", symbol);
   }
   
   Print("📊 Loaded ", positionCount, " active positions");
}

//+------------------------------------------------------------------+
//| Reset daily statistics                                          |
//+------------------------------------------------------------------+
void ResetDailyStats()
{
   dailyPnL = 0;
   totalTrades = 0;
   lastDayReset = TimeCurrent();
   Print("📅 Daily statistics reset");
}

//+------------------------------------------------------------------+
//| Check if new day and reset stats                                |
//+------------------------------------------------------------------+
void CheckDailyReset()
{
   MqlDateTime now, last;
   TimeCurrent(now);
   TimeToStruct(lastDayReset, last);
   
   if(now.day_of_year != last.day_of_year || now.year != last.year)
   {
      ResetDailyStats();
   }
}

//+------------------------------------------------------------------+
//| Normalize pair format (XAU/USD -> XAUUSD)                       |
//+------------------------------------------------------------------+
string NormalizePair(string pair)
{
   string normalized = pair;
   StringReplace(normalized, "/", "");
   StringReplace(normalized, " ", "");
   StringToUpper(normalized);
   
   // Try to find the actual symbol in Market Watch
   string actualSymbol = FindActualSymbol(normalized);
   if(actualSymbol != "")
      return actualSymbol;
   
   return normalized;
}

//+------------------------------------------------------------------+
//| Find actual broker symbol (handles suffixes like .m, .pro etc)  |
//+------------------------------------------------------------------+
string FindActualSymbol(string baseSymbol)
{
   // First try exact match
   if(SymbolInfoInteger(baseSymbol, SYMBOL_EXIST) && 
      SymbolInfoDouble(baseSymbol, SYMBOL_BID) > 0)
      return baseSymbol;
   
   // Common broker suffixes
   string suffixes[] = {".m", ".pro", ".r", ".e", ".i", "_SB", "-ECN", ".raw", ".std"};
   
   for(int i = 0; i < ArraySize(suffixes); i++)
   {
      string testSymbol = baseSymbol + suffixes[i];
      if(SymbolInfoInteger(testSymbol, SYMBOL_EXIST) && 
         SymbolInfoDouble(testSymbol, SYMBOL_BID) > 0)
      {
         Print("📍 Found broker symbol: ", testSymbol, " for ", baseSymbol);
         return testSymbol;
      }
   }
   
   // Try scanning symbols in Market Watch
   int totalSymbols = SymbolsTotal(true);
   for(int i = 0; i < totalSymbols; i++)
   {
      string sym = SymbolName(i, true);
      if(StringFind(sym, baseSymbol) >= 0 || StringFind(sym, StringSubstr(baseSymbol, 0, 6)) >= 0)
      {
         if(SymbolInfoDouble(sym, SYMBOL_BID) > 0)
         {
            Print("📍 Found matching symbol: ", sym, " for ", baseSymbol);
            return sym;
         }
      }
   }
   
   return "";
}

//+------------------------------------------------------------------+
//| Validate that symbol exists and is tradeable                    |
//+------------------------------------------------------------------+
bool ValidateSymbol(string symbol)
{
   if(symbol == "") return false;
   
   // Check if symbol exists
   if(!SymbolInfoInteger(symbol, SYMBOL_EXIST))
   {
      Print("❌ Symbol does not exist: ", symbol);
      return false;
   }
   
   // Check if symbol is available for trading
   if(!SymbolInfoInteger(symbol, SYMBOL_VISIBLE))
   {
      // Try to add to Market Watch
      SymbolSelect(symbol, true);
   }
   
   // Check if we can get a valid price
   double bid = SymbolInfoDouble(symbol, SYMBOL_BID);
   if(bid <= 0)
   {
      Print("❌ Cannot get price for: ", symbol);
      return false;
   }
   
   // Check if trading is allowed
   ENUM_SYMBOL_TRADE_MODE tradeMode = (ENUM_SYMBOL_TRADE_MODE)SymbolInfoInteger(symbol, SYMBOL_TRADE_MODE);
   if(tradeMode == SYMBOL_TRADE_MODE_DISABLED)
   {
      Print("❌ Trading disabled for: ", symbol);
      return false;
   }
   
   return true;
}

//+------------------------------------------------------------------+
//| Extract string value from JSON                                  |
//+------------------------------------------------------------------+
string ExtractJsonString(string json, string key)
{
   string searchKey = "\"" + key + "\":\"";
   int start = StringFind(json, searchKey);
   
   if(start < 0) return "";
   
   start += StringLen(searchKey);
   int end = StringFind(json, "\"", start);
   
   if(end < 0) return "";
   
   return StringSubstr(json, start, end - start);
}

//+------------------------------------------------------------------+
//| Extract double value from JSON                                  |
//+------------------------------------------------------------------+
double ExtractJsonDouble(string json, string key)
{
   string searchKey = "\"" + key + "\":";
   int start = StringFind(json, searchKey);
   
   if(start < 0) return 0;
   
   start += StringLen(searchKey);
   
   // Find end of number
   int end = start;
   while(end < StringLen(json))
   {
      ushort ch = StringGetCharacter(json, end);
      if((ch < '0' || ch > '9') && ch != '.' && ch != '-')
         break;
      end++;
   }
   
   string numStr = StringSubstr(json, start, end - start);
   return StringToDouble(numStr);
}

//+------------------------------------------------------------------+
