//+------------------------------------------------------------------+
//|                                         DUAL_STOP_TRADER.mq5     |
//|                    Dual Pending Stop Order Trading System        |
//|          Opens Buy Stop & Sell Stop - Closes opposite on TP      |
//+------------------------------------------------------------------+
#property copyright "Dual Stop Trading System"
#property version   "1.00"
#property strict

//============== INPUT PARAMETERS ==============
input string Symbol1 = "XAUUSD";              // Primary Symbol
input double LotSize = 0.01;                   // Lot Size
input int    MagicNumber = 777888;             // Magic Number
input int    StopDistance = 200;               // Distance for pending orders (points)
input int    TakeProfit = 300;                 // Take Profit (points)
input int    StopLoss = 150;                   // Stop Loss (points)
input bool   EnableAutoTrading = true;         // Enable Auto Trading
input int    MaxDailyTrades = 10;              // Max trades per day
input double MaxDailyLoss = 1000.0;            // Max daily loss ($)
input int    OrderCheckInterval = 5;           // Check orders every N seconds

//============== LOSS PROTECTION SETTINGS ==============
input bool   EnableLossProtection = true;      // Enable loss protection
input double MinProfitToClose = 50.0;          // Minimum profit ($) to allow closing opposite
input double MaxLossToKeepOpen = -200.0;       // Keep position open if loss exceeds this ($)
input int    MinPipsProfit = 30;               // Minimum profit in pips to close opposite
input bool   OnlyCloseOnProfit = true;         // Only close opposite if in profit

//============== RSI TRADING SETTINGS ==============
input int    RSI_Period = 14;                  // RSI Period
input bool   EnableRSI_Logic = true;           // Enable RSI-based logic
input bool   OnlyTradeRSI_Zones = true;        // Only trade in RSI demand/supply zones
input bool   RSI_Confirmation = true;          // Require RSI confirmation for trades
input double RSI_DemandLevel = 20.0;           // RSI Demand/Buy level
input double RSI_SupplyLevel = 80.0;           // RSI Supply/Sell level
input double RSI_ExtremeDemand = 10.0;         // Extreme demand zone (0-10)
input double RSI_ExtremeSupply = 90.0;         // Extreme supply zone (90-100)

//============== GLOBAL VARIABLES ==============
ulong buyStopTicket = 0;
ulong sellStopTicket = 0;
datetime lastOrderTime = 0;
int dailyTradeCount = 0;
double dailyPnL = 0;
datetime lastDayReset = 0;
bool systemActive = false;

// RSI Variables
int rsiHandle = INVALID_HANDLE;
double rsiBuffer[];
double currentRSI = 50.0;
string lastRSIZone = "NEUTRAL";
bool rsiTrendBullish = false;
bool rsiTrendBearish = false;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("═══════════════════════════════════════════════════════════");
   Print("🚀 DUAL STOP TRADER - Initialized");
   Print("═══════════════════════════════════════════════════════════");
   Print("📊 Symbol: ", Symbol1);
   Print("💰 Lot Size: ", LotSize);
   Print("📏 Stop Distance: ", StopDistance, " points");
   Print("🎯 Take Profit: ", TakeProfit, " points");
   Print("🛡️ Stop Loss: ", StopLoss, " points");
   Print("🔒 Loss Protection: ", (EnableLossProtection ? "ENABLED" : "DISABLED"));
   if(EnableLossProtection)
   {
      Print("   💰 Min Profit to Close: $", MinProfitToClose);
      Print("   🚫 Max Loss to Keep Open: $", MaxLossToKeepOpen);
      Print("   📊 Min Pips Profit: ", MinPipsProfit);
      Print("   ✅ Only Close on Profit: ", (OnlyCloseOnProfit ? "YES" : "NO"));
   }
   Print("📈 RSI Logic: ", (EnableRSI_Logic ? "ENABLED" : "DISABLED"));
   if(EnableRSI_Logic)
   {
      Print("   🔢 RSI Period: ", RSI_Period);
      Print("   📉 Demand Zone: ", RSI_DemandLevel, " | Supply Zone: ", RSI_SupplyLevel);
      Print("   ⚡ Extreme Demand: ", RSI_ExtremeDemand, " | Extreme Supply: ", RSI_ExtremeSupply);
      Print("   🎯 Only Trade Zones: ", (OnlyTradeRSI_Zones ? "YES" : "NO"));
   }
   Print("═══════════════════════════════════════════════════════════");
   
   // Validate symbol
   if(!SymbolSelect(Symbol1, true))
   {
      Print("❌ Failed to select symbol: ", Symbol1);
      return INIT_FAILED;
   }
   
   // Initialize RSI indicator
   if(EnableRSI_Logic)
   {
      rsiHandle = iRSI(Symbol1, PERIOD_CURRENT, RSI_Period, PRICE_CLOSE);
      if(rsiHandle == INVALID_HANDLE)
      {
         Print("❌ Failed to create RSI indicator!");
         return INIT_FAILED;
      }
      ArraySetAsSeries(rsiBuffer, true);
      Print("✅ RSI Indicator initialized successfully");
   }
   
   // Set timer
   EventSetTimer(OrderCheckInterval);
   
   // Reset daily stats
   ResetDailyStats();
   
   // Check for existing orders
   LoadExistingOrders();
   
   Print("✅ System Ready - Waiting for setup...");
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
   if(rsiHandle != INVALID_HANDLE)
      IndicatorRelease(rsiHandle);
   Print("❌ DUAL STOP TRADER Stopped - Reason: ", reason);
}

//+------------------------------------------------------------------+
//| Timer function                                                   |
//+------------------------------------------------------------------+
void OnTimer()
{
   if(!EnableAutoTrading) return;
   
   // Update RSI data
   if(EnableRSI_Logic)
      UpdateRSI();
   
   // Check daily reset
   CheckDailyReset();
   
   // Check daily limits
   if(dailyPnL <= -MaxDailyLoss)
   {
      Print("🛑 DAILY LOSS LIMIT REACHED: $", MathAbs(dailyPnL));
      return;
   }
   
   if(dailyTradeCount >= MaxDailyTrades)
   {
      Print("🛑 MAX DAILY TRADES REACHED: ", dailyTradeCount);
      return;
   }
   
   // Check order status
   CheckOrderStatus();
   
   // If no active orders/positions, place new ones (with RSI validation)
   if(buyStopTicket == 0 && sellStopTicket == 0 && !HasOpenPositions())
   {
      if(ValidateRSI_TradingConditions())
         PlaceDualStopOrders();
   }
}

//+------------------------------------------------------------------+
//| Tick function                                                   |
//+------------------------------------------------------------------+
void OnTick()
{
   // Monitor active positions for TP hits
   if(HasOpenPositions())
   {
      MonitorPositionsForTP();
   }
}

//+------------------------------------------------------------------+
//| Place both Buy Stop and Sell Stop orders                        |
//+------------------------------------------------------------------+
void PlaceDualStopOrders()
{
   if(!EnableAutoTrading) return;
   
   // Get current price and symbol info
   double ask = SymbolInfoDouble(Symbol1, SYMBOL_ASK);
   double bid = SymbolInfoDouble(Symbol1, SYMBOL_BID);
   double point = SymbolInfoDouble(Symbol1, SYMBOL_POINT);
   int digits = (int)SymbolInfoInteger(Symbol1, SYMBOL_DIGITS);
   
   if(ask <= 0 || bid <= 0)
   {
      Print("❌ Invalid price data for ", Symbol1);
      return;
   }
   
   // Calculate order prices with RSI bias
   double currentPrice = (ask + bid) / 2;
   int adjustedStopDistance = StopDistance;
   
   // RSI-BASED DISTANCE ADJUSTMENT
   if(EnableRSI_Logic)
   {
      string rsiZone = GetRSI_Zone(currentRSI);
      Print("📊 Current RSI: ", DoubleToString(currentRSI, 2), " - Zone: ", rsiZone);
      
      // Adjust stop distance based on RSI zone
      if(currentRSI <= RSI_ExtremeDemand) // 0-10: Extreme demand
      {
         adjustedStopDistance = (int)(StopDistance * 0.7); // Closer stops in extreme zones
         Print("⚡ EXTREME DEMAND detected - reducing stop distance to ", adjustedStopDistance);
      }
      else if(currentRSI >= RSI_ExtremeSupply) // 90-100: Extreme supply  
      {
         adjustedStopDistance = (int)(StopDistance * 0.7);
         Print("⚡ EXTREME SUPPLY detected - reducing stop distance to ", adjustedStopDistance);
      }
      else if(currentRSI <= RSI_DemandLevel) // 20: Buy zone
      {
         adjustedStopDistance = (int)(StopDistance * 0.8);
         Print("📈 BUY ZONE detected - reducing stop distance to ", adjustedStopDistance);
      }
      else if(currentRSI >= RSI_SupplyLevel) // 80: Sell zone
      {
         adjustedStopDistance = (int)(StopDistance * 0.8);
         Print("📉 SELL ZONE detected - reducing stop distance to ", adjustedStopDistance);
      }
   }
   
   double buyStopPrice = NormalizeDouble(currentPrice + adjustedStopDistance * point, digits);
   double sellStopPrice = NormalizeDouble(currentPrice - adjustedStopDistance * point, digits);
   
   // Calculate TP and SL with RSI optimization
   int adjustedTP = TakeProfit;
   int adjustedSL = StopLoss;
   
   if(EnableRSI_Logic)
   {
      // Increase TP in extreme zones (higher probability)
      if(currentRSI <= RSI_ExtremeDemand || currentRSI >= RSI_ExtremeSupply)
      {
         adjustedTP = (int)(TakeProfit * 1.5);
         Print("🎯 Extreme zone - increasing TP to ", adjustedTP);
      }
   }
   
   // Calculate TP and SL for BUY STOP
   double buyTP = NormalizeDouble(buyStopPrice + adjustedTP * point, digits);
   double buySL = NormalizeDouble(buyStopPrice - adjustedSL * point, digits);
   
   // Calculate TP and SL for SELL STOP
   double sellTP = NormalizeDouble(sellStopPrice - adjustedTP * point, digits);
   double sellSL = NormalizeDouble(sellStopPrice + adjustedSL * point, digits);
   
   Print("═══════════════════════════════════════════════════════════");
   Print("📊 PLACING RSI-OPTIMIZED DUAL STOP ORDERS");
   if(EnableRSI_Logic)
      Print("   RSI: ", DoubleToString(currentRSI, 2), " (", GetRSI_Zone(currentRSI), ")");
   Print("   Current Price: ", currentPrice);
   Print("   Buy Stop: ", buyStopPrice, " TP: ", buyTP, " SL: ", buySL);
   Print("   Sell Stop: ", sellStopPrice, " TP: ", sellTP, " SL: ", sellSL);
   Print("═══════════════════════════════════════════════════════════");
   
   // Place BUY STOP
   buyStopTicket = PlacePendingOrder(ORDER_TYPE_BUY_STOP, buyStopPrice, buyTP, buySL);
   
   // Place SELL STOP
   sellStopTicket = PlacePendingOrder(ORDER_TYPE_SELL_STOP, sellStopPrice, sellTP, sellSL);
   
   if(buyStopTicket > 0 && sellStopTicket > 0)
   {
      Print("✅ Both RSI-optimized orders placed successfully!");
      Print("   Buy Stop: #", buyStopTicket);
      Print("   Sell Stop: #", sellStopTicket);
      lastOrderTime = TimeCurrent();
      systemActive = true;
   }
   else
   {
      Print("⚠️ Failed to place orders - resetting...");
      CleanupOrders();
   }
}

//+------------------------------------------------------------------+
//| Place pending order                                             |
//+------------------------------------------------------------------+
ulong PlacePendingOrder(ENUM_ORDER_TYPE orderType, double price, double tp, double sl)
{
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   // Validate lot size
   double minLot = SymbolInfoDouble(Symbol1, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(Symbol1, SYMBOL_VOLUME_MAX);
   double lotStep = SymbolInfoDouble(Symbol1, SYMBOL_VOLUME_STEP);
   double validLot = LotSize;
   
   if(validLot < minLot) validLot = minLot;
   if(validLot > maxLot) validLot = maxLot;
   validLot = MathFloor(validLot / lotStep) * lotStep;
   
   // Get filling mode
   int filling_mode = (int)SymbolInfoInteger(Symbol1, SYMBOL_FILLING_MODE);
   ENUM_ORDER_TYPE_FILLING type_filling = ORDER_FILLING_FOK;
   if((filling_mode & 2) == 2)
      type_filling = ORDER_FILLING_IOC;
   else if(filling_mode == 0)
      type_filling = ORDER_FILLING_RETURN;
   
   request.action = TRADE_ACTION_PENDING;
   request.symbol = Symbol1;
   request.volume = validLot;
   request.type = orderType;
   request.price = price;
   request.sl = sl;
   request.tp = tp;
   request.deviation = 10;
   request.magic = MagicNumber;
   request.comment = (orderType == ORDER_TYPE_BUY_STOP) ? "DUAL_BUY_STOP" : "DUAL_SELL_STOP";
   request.type_filling = type_filling;
   
   if(OrderSend(request, result) && result.retcode == TRADE_RETCODE_DONE)
   {
      Print("✅ ", request.comment, " placed: #", result.order);
      return result.order;
   }
   else
   {
      Print("❌ Failed to place ", request.comment, ": ", result.comment, " (", result.retcode, ")");
      return 0;
   }
}

//+------------------------------------------------------------------+
//| Check order status                                              |
//+------------------------------------------------------------------+
void CheckOrderStatus()
{
   // Check if buy stop still exists
   if(buyStopTicket > 0 && !OrderSelect(buyStopTicket))
   {
      // Order was triggered or deleted
      Print("📍 Buy Stop #", buyStopTicket, " no longer pending");
      
      // Check if it became a position
      if(PositionSelectByTicket(buyStopTicket))
      {
         Print("✅ Buy Stop triggered - now active position");
      }
      else
      {
         buyStopTicket = 0;
      }
   }
   
   // Check if sell stop still exists
   if(sellStopTicket > 0 && !OrderSelect(sellStopTicket))
   {
      Print("📍 Sell Stop #", sellStopTicket, " no longer pending");
      
      if(PositionSelectByTicket(sellStopTicket))
      {
         Print("✅ Sell Stop triggered - now active position");
      }
      else
      {
         sellStopTicket = 0;
      }
   }
}

//+------------------------------------------------------------------+
//| Monitor positions for TP hits                                   |
//+------------------------------------------------------------------+
void MonitorPositionsForTP()
{
   bool buyPositionExists = false;
   bool sellPositionExists = false;
   bool buyHitTP = false;
   bool sellHitTP = false;
   
   // Check all positions
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      if(PositionGetInteger(POSITION_MAGIC) != MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != Symbol1) continue;
      
      long posType = PositionGetInteger(POSITION_TYPE);
      double profit = PositionGetDouble(POSITION_PROFIT);
      double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
      double currentPrice = (posType == POSITION_TYPE_BUY) ? 
                           SymbolInfoDouble(Symbol1, SYMBOL_BID) :
                           SymbolInfoDouble(Symbol1, SYMBOL_ASK);
      double tp = PositionGetDouble(POSITION_TP);
      double point = SymbolInfoDouble(Symbol1, SYMBOL_POINT);
      
      // Calculate pip profit/loss
      double pipProfit = (posType == POSITION_TYPE_BUY) ? 
                        (currentPrice - openPrice) / point :
                        (openPrice - currentPrice) / point;
      
      if(posType == POSITION_TYPE_BUY)
      {
         buyPositionExists = true;
         
         // Check if price reached TP (within 5 points tolerance)
         if(tp > 0 && currentPrice >= tp - 5 * point)
         {
            Print("🎯 BUY position hit TP! Profit: $", profit, " (", pipProfit, " pips)");
            
            // ROBUST LOSS PROTECTION - Check opposite position before closing
            if(ValidateOppositeCloseConditions(POSITION_TYPE_SELL))
            {
               Print("✅ Safe to close SELL position - proceeding...");
               buyHitTP = true;
               CloseOppositePosition(POSITION_TYPE_SELL);
               dailyPnL += profit;
               dailyTradeCount++;
            }
            else
            {
               Print("🛡️ LOSS PROTECTION: Keeping SELL position open (would close at loss)");
            }
         }
      }
      else if(posType == POSITION_TYPE_SELL)
      {
         sellPositionExists = true;
         
         // Check if price reached TP
         if(tp > 0 && currentPrice <= tp + 5 * point)
         {
            Print("🎯 SELL position hit TP! Profit: $", profit, " (", pipProfit, " pips)");
            
            // ROBUST LOSS PROTECTION - Check opposite position before closing
            if(ValidateOppositeCloseConditions(POSITION_TYPE_BUY))
            {
               Print("✅ Safe to close BUY position - proceeding...");
               sellHitTP = true;
               CloseOppositePosition(POSITION_TYPE_BUY);
               dailyPnL += profit;
               dailyTradeCount++;
            }
            else
            {
               Print("🛡️ LOSS PROTECTION: Keeping BUY position open (would close at loss)");
            }
         }
      }
   }
   
   // If one side closed, delete opposite pending order
   if(buyHitTP)
   {
      DeletePendingOrder(sellStopTicket);
      sellStopTicket = 0;
      buyStopTicket = 0;
      systemActive = false;
      Print("✅ Cycle complete - ready for new setup");
   }
   
   if(sellHitTP)
   {
      DeletePendingOrder(buyStopTicket);
      buyStopTicket = 0;
      sellStopTicket = 0;
      systemActive = false;
      Print("✅ Cycle complete - ready for new setup");
   }
}

//+------------------------------------------------------------------+
//| Validate if opposite position can be safely closed              |
//+------------------------------------------------------------------+
bool ValidateOppositeCloseConditions(long positionType)
{
   if(!EnableLossProtection)
   {
      Print("📊 Loss protection disabled - allowing close");
      return true;
   }
   
   // Find the opposite position
   for(int i = 0; i < PositionsTotal(); i++)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      if(PositionGetInteger(POSITION_MAGIC) != MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != Symbol1) continue;
      
      long posType = PositionGetInteger(POSITION_TYPE);
      
      if(posType == positionType)
      {
         double profit = PositionGetDouble(POSITION_PROFIT);
         double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
         double currentPrice = (posType == POSITION_TYPE_BUY) ? 
                              SymbolInfoDouble(Symbol1, SYMBOL_BID) :
                              SymbolInfoDouble(Symbol1, SYMBOL_ASK);
         double point = SymbolInfoDouble(Symbol1, SYMBOL_POINT);
         
         // Calculate pip profit/loss
         double pipProfit = (posType == POSITION_TYPE_BUY) ? 
                           (currentPrice - openPrice) / point :
                           (openPrice - currentPrice) / point;
         
         Print("🔍 Checking opposite position: Profit=$", profit, " Pips=", pipProfit);
         
         // Check if position is in significant loss - DON'T CLOSE
         if(profit <= MaxLossToKeepOpen)
         {
            Print("🛑 Position loss too high: $", profit, " <= $", MaxLossToKeepOpen, " - KEEPING OPEN");
            return false;
         }
         
         // If OnlyCloseOnProfit is enabled, only close if in profit
         if(OnlyCloseOnProfit && profit < 0)
         {
            Print("💰 OnlyCloseOnProfit enabled - position at loss ($", profit, ") - KEEPING OPEN");
            return false;
         }
         
         // Check minimum profit requirement
         if(profit < MinProfitToClose && profit >= 0)
         {
            Print("📈 Profit too small: $", profit, " < $", MinProfitToClose, " - KEEPING OPEN");
            return false;
         }
         
         // Check minimum pip profit requirement
         if(pipProfit < MinPipsProfit && pipProfit >= 0)
         {
            Print("📏 Pip profit too small: ", pipProfit, " < ", MinPipsProfit, " - KEEPING OPEN");
            return false;
         }
         
         Print("✅ All validation checks passed - safe to close");
         return true;
      }
   }
   
   Print("❓ No opposite position found - allowing close");
   return true;
}

//+------------------------------------------------------------------+
//| Close opposite position when TP is hit                          |
//+------------------------------------------------------------------+
void CloseOppositePosition(long positionType)
{
   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0) continue;
      
      if(PositionGetInteger(POSITION_MAGIC) != MagicNumber) continue;
      if(PositionGetString(POSITION_SYMBOL) != Symbol1) continue;
      
      long posType = PositionGetInteger(POSITION_TYPE);
      
      if(posType == positionType)
      {
         double profit = PositionGetDouble(POSITION_PROFIT);
         double openPrice = PositionGetDouble(POSITION_PRICE_OPEN);
         double currentPrice = (posType == POSITION_TYPE_BUY) ? 
                              SymbolInfoDouble(Symbol1, SYMBOL_BID) :
                              SymbolInfoDouble(Symbol1, SYMBOL_ASK);
         double point = SymbolInfoDouble(Symbol1, SYMBOL_POINT);
         double pipProfit = (posType == POSITION_TYPE_BUY) ? 
                           (currentPrice - openPrice) / point :
                           (openPrice - currentPrice) / point;
         
         Print("🔄 Closing opposite position: #", ticket, " | P&L: $", profit, " (", pipProfit, " pips)");
         ClosePosition(ticket);
         
         // Update daily P&L with the closed position
         dailyPnL += profit;
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
   double profit = PositionGetDouble(POSITION_PROFIT);
   
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   // Get filling mode
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
   
   if(OrderSend(request, result) && result.retcode == TRADE_RETCODE_DONE)
   {
      Print("✅ Position closed: #", ticket, " | Profit: $", profit);
   }
   else
   {
      Print("❌ Failed to close #", ticket, ": ", result.comment);
   }
}

//+------------------------------------------------------------------+
//| Delete pending order                                            |
//+------------------------------------------------------------------+
void DeletePendingOrder(ulong ticket)
{
   if(ticket == 0) return;
   
   if(!OrderSelect(ticket)) return; // Order doesn't exist or already triggered
   
   MqlTradeRequest request;
   MqlTradeResult result;
   ZeroMemory(request);
   ZeroMemory(result);
   
   request.action = TRADE_ACTION_REMOVE;
   request.order = ticket;
   
   if(OrderSend(request, result) && result.retcode == TRADE_RETCODE_DONE)
   {
      Print("🗑️ Deleted pending order: #", ticket);
   }
   else
   {
      Print("⚠️ Failed to delete order #", ticket, ": ", result.comment);
   }
}

//+------------------------------------------------------------------+
//| Check if we have open positions                                 |
//+------------------------------------------------------------------+
bool HasOpenPositions()
{
   for(int i = 0; i < PositionsTotal(); i++)
   {
      if(PositionGetTicket(i) == 0) continue;
      if(PositionGetInteger(POSITION_MAGIC) == MagicNumber && 
         PositionGetString(POSITION_SYMBOL) == Symbol1)
         return true;
   }
   return false;
}

//+------------------------------------------------------------------+
//| Load existing orders on startup                                 |
//+------------------------------------------------------------------+
void LoadExistingOrders()
{
   // Check for pending orders
   for(int i = 0; i < OrdersTotal(); i++)
   {
      ulong ticket = OrderGetTicket(i);
      if(ticket == 0) continue;
      
      if(OrderGetInteger(ORDER_MAGIC) != MagicNumber) continue;
      if(OrderGetString(ORDER_SYMBOL) != Symbol1) continue;
      
      ENUM_ORDER_TYPE orderType = (ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE);
      
      if(orderType == ORDER_TYPE_BUY_STOP)
      {
         buyStopTicket = ticket;
         Print("📂 Loaded Buy Stop: #", ticket);
      }
      else if(orderType == ORDER_TYPE_SELL_STOP)
      {
         sellStopTicket = ticket;
         Print("📂 Loaded Sell Stop: #", ticket);
      }
   }
   
   if(buyStopTicket > 0 || sellStopTicket > 0)
      systemActive = true;
}

//+------------------------------------------------------------------+
//| Cleanup all orders                                              |
//+------------------------------------------------------------------+
void CleanupOrders()
{
   if(buyStopTicket > 0)
   {
      DeletePendingOrder(buyStopTicket);
      buyStopTicket = 0;
   }
   
   if(sellStopTicket > 0)
   {
      DeletePendingOrder(sellStopTicket);
      sellStopTicket = 0;
   }
   
   systemActive = false;
}

//+------------------------------------------------------------------+
//| Reset daily statistics                                          |
//+------------------------------------------------------------------+
void ResetDailyStats()
{
   dailyPnL = 0;
   dailyTradeCount = 0;
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
      Print("═══════════════════════════════════════════════════════════");
      Print("📊 DAILY REPORT");
      Print("   Trades: ", dailyTradeCount);
      Print("   P&L: $", dailyPnL);
      Print("═══════════════════════════════════════════════════════════");
      ResetDailyStats();
   }
}

//+------------------------------------------------------------------+
//| Update RSI data and analysis                                    |
//+------------------------------------------------------------------+
void UpdateRSI()
{
   if(rsiHandle == INVALID_HANDLE) return;
   
   if(CopyBuffer(rsiHandle, 0, 0, 3, rsiBuffer) <= 0)
   {
      Print("⚠️ Failed to get RSI data");
      return;
   }
   
   currentRSI = rsiBuffer[0];
   string currentZone = GetRSI_Zone(currentRSI);
   
   // Update trend direction based on RSI movement
   if(ArraySize(rsiBuffer) >= 2)
   {
      double prevRSI = rsiBuffer[1];
      rsiTrendBullish = (currentRSI > prevRSI && currentRSI < 50);
      rsiTrendBearish = (currentRSI < prevRSI && currentRSI > 50);
   }
   
   // Log significant RSI zone changes
   if(currentZone != lastRSIZone)
   {
      Print("📊 RSI Zone Changed: ", lastRSIZone, " → ", currentZone, " (RSI: ", DoubleToString(currentRSI, 2), ")");
      lastRSIZone = currentZone;
   }
}

//+------------------------------------------------------------------+
//| Get RSI zone name                                               |
//+------------------------------------------------------------------+
string GetRSI_Zone(double rsi)
{
   if(rsi <= RSI_ExtremeDemand) return "EXTREME_DEMAND";
   if(rsi <= RSI_DemandLevel) return "DEMAND";
   if(rsi <= 30) return "OVERSOLD";
   if(rsi >= RSI_ExtremeSupply) return "EXTREME_SUPPLY";
   if(rsi >= RSI_SupplyLevel) return "SUPPLY";
   if(rsi >= 70) return "OVERBOUGHT";
   if(rsi >= 45 && rsi <= 55) return "NEUTRAL";
   if(rsi < 50) return "BEARISH_BIAS";
   return "BULLISH_BIAS";
}

//+------------------------------------------------------------------+
//| Validate RSI trading conditions                                 |
//+------------------------------------------------------------------+
bool ValidateRSI_TradingConditions()
{
   if(!EnableRSI_Logic)
   {
      Print("📊 RSI logic disabled - proceeding with orders");
      return true;
   }
   
   string rsiZone = GetRSI_Zone(currentRSI);
   
   // If OnlyTradeRSI_Zones is enabled, only trade in specific zones
   if(OnlyTradeRSI_Zones)
   {
      bool isGoodZone = (currentRSI <= RSI_DemandLevel || currentRSI >= RSI_SupplyLevel || 
                         currentRSI <= RSI_ExtremeDemand || currentRSI >= RSI_ExtremeSupply);
      
      if(!isGoodZone)
      {
         Print("⏸️ RSI not in trading zone: ", DoubleToString(currentRSI, 2), " (", rsiZone, ") - waiting...");
         return false;
      }
   }
   
   // Additional RSI confirmation logic
   if(RSI_Confirmation)
   {
      // Don't trade in dead zone (45-55)
      if(currentRSI >= 45 && currentRSI <= 55)
      {
         Print("⏸️ RSI in dead zone (45-55): ", DoubleToString(currentRSI, 2), " - waiting for clear signal");
         return false;
      }
   }
   
   Print("✅ RSI conditions validated - RSI: ", DoubleToString(currentRSI, 2), " (", rsiZone, ")");
   return true;
}

//+------------------------------------------------------------------+
