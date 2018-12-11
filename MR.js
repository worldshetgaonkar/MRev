// Main Cloud Script 

var  MaxReferral = 1000;
var  ReferralCodeRedeemReward = 25;     
var  ReferrerReward = 2500; 
var  TerminateReferralProcessAt = 488; 

// Pin Stuff :-

var Pin_Limit = 99;

// CC Stuff :-

var CC_Code = "CC";

var  Referral_Badge_Item_ID = "ReferralBadge";

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

handlers.ClientCreatedAc_CallBack = function () 
{
// As A Wellcome Bonus Announcement :-
MakeAnnouncementPop_Up (currentPlayerId,106);
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#region "Referral Method's" :-

handlers.StoreRedeemCouponReward_Announcement_CallBack = function ()
{
MakeAnnouncementPop_Up (currentPlayerId,105);
}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
handlers.IsReferralProcessOver = function () // This Method will be called By Client ,When the CC of the current client Change ! 
{

var GetCurrentUserReadOnlyDataRequest = {"PlayFabId" : currentPlayerId,"Keys": ["ReferralPending"]}; 

var GetCurrentUserReadOnlyDataResult  = server.GetUserReadOnlyData(GetCurrentUserReadOnlyDataRequest);


if(GetCurrentUserReadOnlyDataResult.Data.hasOwnProperty("ReferralPending"))
{

var GetUserInventoryRequest = {"PlayFabId": currentPlayerId};

var GetUserInventoryResult  = server.GetUserInventory(GetUserInventoryRequest);


if(GetUserInventoryResult.VirtualCurrency["CC"] >= TerminateReferralProcessAt) 
{
TerminateReferralProcess(GetCurrentUserReadOnlyDataResult.Data["ReferralPending"].Value)
;
}
else
{
return; // Cannot terminate Referral Process due to low CC ;
}

} // END OF THE MAIN IF; 
else
{
log.info("Client is not involved in Referral Process!");
}

} // END OF THE METHOD ! 


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// FUNCTION TerminateReferralProcess 

function TerminateReferralProcess (ReferralCode)
{

if
(ReferralCode == null || ReferralCode  === undefined || ReferralCode  === "" || ReferralCode === "Own" || ReferralCode === "ValueNotFound")
{
log.error("Terminated TerminateReferralProcess , Due to Error found in the ReferralCode Parameter");
return;
}

var UpdateUserReadOnlyDataRequest = {
"PlayFabId": currentPlayerId ,
"Data": {}
};


UpdateUserReadOnlyDataRequest.Data ["ReferralPending"] = null;



var UpdateUserReadOnlyDataResult  = server.UpdateUserReadOnlyData(UpdateUserReadOnlyDataRequest);



if (UpdateUserReadOnlyDataResult) 
{

IssueClientCC(ReferralCode,ReferrerReward,103); 


var MainKey       = "ReferralConnected"; 
var MainKey_Value = [];

var GetReferrerUserReadOnlyDataRequest =  {"PlayFabId": ReferralCode ,"Keys": [MainKey]}; 

var GetReferrerUserReadOnlyDataResult  = server.GetUserReadOnlyData(GetReferrerUserReadOnlyDataRequest);


if
(GetReferrerUserReadOnlyDataResult.Data.hasOwnProperty(MainKey))   
{

MainKey_Value = JSON.parse(GetReferrerUserReadOnlyDataResult.Data[MainKey].Value);

for(var Index in MainKey_Value)
{
if(MainKey_Value[Index] ===  currentPlayerId) {MainKey_Value[Index] = "null";} 
}

var UpdateReferrerUserReadOnlyDataRequest = {"PlayFabId": ReferralCode,"Data": {}};


UpdateReferrerUserReadOnlyDataRequest.Data [MainKey] = JSON.stringify(MainKey_Value);


var UpdateReferrerUserReadOnlyDataResult  = server.UpdateUserReadOnlyData(UpdateReferrerUserReadOnlyDataRequest);


} 

else
{
log.info("TerminateReferralProcess Failed Due To ReferralConnected Key Not Found !");
}

} // END OF THE MAIN IF "if (UpdateUserReadOnlyDataResult)";

} // END OF FUNCTION; 

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Main Function Of Referral Functionility "AttachReferralCode" which will be called by the client when we creat a new Zero Account 

handlers.AttachReferralCode = function (GivenReferralCode) // GivenReferralCode Is Aspected Form The Client Side !
{  

var ReferralCode            = "NoValue";

ReferralCode                = GivenReferralCode;


var GetUserInventoryRequest = {"PlayFabId": currentPlayerId};


var GetUserInventoryResult  = server.GetUserInventory(GetUserInventoryRequest);


for(var Index in GetUserInventoryResult.Inventory)

{


if(GetUserInventoryResult.Inventory[Index].ItemId === Referral_Badge_Item_ID)

{TerminateClientFromZero (); log.error("TerminateClientFromZero Due to Miss-Use !");  return;}

}


if
(ReferralCode == null || ReferralCode  === undefined || ReferralCode  === "" || ReferralCode === "Own" || ReferralCode === "NoValue")
{
log.info(currentPlayerId + " Has no Referral code Attach !");
return;
}


if
(ReferralCode == currentPlayerId)
{
TerminateClientFromZero ();
log.info("Terminated AttachReferralCode Because The ReferralCode == CurrentPlayerId");
return;
}


var GetClientAccountInfoRequest = null;

GetClientAccountInfoRequest     = {"PlayFabId":ReferralCode};

try
{
var GetClientAccountInfoResult  = server.GetUserAccountInfo (GetClientAccountInfoRequest);
}
catch(e) 
{
log.info("Terminated AttachReferral Code Because Referral Code Did Not Fetch Zero Account !"); 
MakeAnnouncementPop_Up (currentPlayerId,101); 
return;
}


StoreTrackDataOverCurrentClient (ReferralCode);

} // END OF THE FUNCTION; 

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Attach ReferralCode Helper Methods 

function StoreTrackDataOverCurrentClient (ReferralCode)
{


var GetCurrentClientReadOnlyDataRequest    = {"PlayFabId": currentPlayerId}; 

var GetCurrentClientReadOnlyDataResult     = server.GetUserReadOnlyData(GetCurrentClientReadOnlyDataRequest);

var UpdateCurrentClientReadOnlyDataRequest = {
"PlayFabId": currentPlayerId ,
"Data": {}
};

UpdateCurrentClientReadOnlyDataRequest.Data ["ReferralPending"] = ReferralCode;


var UpdateCurrentClientReadOnlyDataResult  = server.UpdateUserReadOnlyData(UpdateCurrentClientReadOnlyDataRequest);



if(UpdateCurrentClientReadOnlyDataResult ) 
{

IssueCurrentClientReferralBadge ();

StoreTrackDataOveReferrer (ReferralCode)
;

}

} // END OF THE FUNCTION ! 

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

IssueCurrentClientReferralBadge = function () 
{

var GrantItemsToUserRequest = {"PlayFabId":currentPlayerId,"CatalogVersion":"MainCatalog","ItemIds": [Referral_Badge_Item_ID]};

var Result = server.GrantItemsToUser (GrantItemsToUserRequest);

} 

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

function StoreTrackDataOveReferrer (Referral_Code)
{


var MainKey       = "ReferralConnected";
var MainKey_Value = [];


var GetReferrerUserReadOnlyDataRequest = {
"PlayFabId": Referral_Code ,
"Keys": [MainKey]
}; 


var GetReferrerUserReadOnlyDataResult  = server.GetUserReadOnlyData (GetReferrerUserReadOnlyDataRequest);

if
(!(GetReferrerUserReadOnlyDataResult.Data.hasOwnProperty(MainKey)))
{          
MainKey_Value.push (currentPlayerId);
}

else

{                  
MainKey_Value = JSON.parse(GetReferrerUserReadOnlyDataResult.Data[MainKey].Value);

if
(Array.isArray(MainKey_Value ))      
{
    

if(MainKey_Value.length < MaxReferral) // MaxReferral Variable Is Define At Top !   
{

MainKey_Value.push(currentPlayerId);

}
else 
{
log.error (Referral_Code + " Has Exceeded the max Referral !");
MakeAnnouncementPop_Up(Referral_Code,104); 
MakeAnnouncementPop_Up(CurrentPlayerId,101); 
return;  
}

}

} // END OF THE ELSE ! 


var UpdateUserReadOnlyDataRequest = {
"PlayFabId": Referral_Code,
"Data": {}
};

UpdateUserReadOnlyDataRequest.Data [MainKey] = JSON.stringify(MainKey_Value);

var UpdateUserReadOnlyDataResult = server.UpdateUserReadOnlyData(UpdateUserReadOnlyDataRequest);

if(UpdateUserReadOnlyDataResult) 
{
IssueClientCC (currentPlayerId,ReferralCodeRedeemReward,100);
// Inform the Referred Client That The Current Client Has Used His Referral Code 
MakeAnnouncementPop_Up (Referral_Code,102);
}

} // END OF THE FUNCTION !  

//#endregion

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#region "Coupon Method's :-"

// 100 :- "Coupon Code Not Found" or "Coupon Code Not Set in The Title";
// 101 :- "Coupon Code AllReady Redeem !";
// 102 :- "Sucessful To Redeem Coupon !";

handlers.Attach_Redeem_Coupon = function (CouponCode) //  CouponCode Is Aspected Form The Client Side !
{

var SingleCouponCodeV = "NVS"; // "NVS" = "No Value Set";


// Request :- 

var GetTitleInternalDataRequest = {"Keys": ["SingleCouponCode"]}; 

// Submit of the Request :-

var GetTitleInternalDataResult  = server.GetTitleInternalData(GetTitleInternalDataRequest);



// Result :-

if(GetTitleInternalDataResult.Data.hasOwnProperty("SingleCouponCode"))
{

SingleCouponCodeV = GetTitleInternalDataResult.Data["SingleCouponCode"];

if(SingleCouponCodeV == "NVS") // Return Error ("Due To Key Not Set").
{
Revoke_SingleCouponCode_Item ();
log.info("Return Due To Key 'SingleCouponCode' Not Set To The Value !");
return {ReturnValue : "100"}; 
}

// Then Compair The Given Coupon Code With The Title Config One But Before Make Sure That The SingleCouponCode_Item Class Item Is Not Present In Client Inventory :-

if(SingleCouponCodeV === CouponCode)
{

// Frist We will Make Sure That the SingleCouponCode_Item With The Tag Does Not Match With Current SingleCouponCodeV :-

// Build Of Request :-
var GetUserInventoryRequest = {"PlayFabId": currentPlayerId};

// Submit Of Request :-
var GetUserInventoryResult  = server.GetUserInventory(GetUserInventoryRequest);

// Result :-

var SingleCouponCode_Item_ItemID = CouponCode + "_Badge";

for(var Index in GetUserInventoryResult.Inventory)     
{

// Frist We Will Make Sure If That Item Belongs To The "SingleCouponCode_Item" Class :- 

if(GetUserInventoryResult.Inventory[Index].ItemClass === "SingleCouponCode_Item")          
{

if(GetUserInventoryResult.Inventory[Index].ItemId === SingleCouponCode_Item_ItemID )
{
return {ReturnValue : "101"};
// Because The Coupon Code Is AllReady Redeem ! 
}

} 

}// END OF THE FOR EACH LOOP ! 

// Then Revoke That Item As A SingleCouponCode_Item And Move On :-

Revoke_SingleCouponCode_Item ();

// Now We Have To Grant The Coupon Code Bundle :- 

var GrantItemsToUserRequest = {"PlayFabId":currentPlayerId,"CatalogVersion":"MainCatalog","ItemIds": [CouponCode]};

var Result = server.GrantItemsToUser (GrantItemsToUserRequest);

if(Result)
{
log.info("Sucessfull To Redeem Single Coupon Code !");
MakeAnnouncementPop_Up (currentPlayerId,105);
return {ReturnValue : "102"};
}
else {return {ReturnValue : "100"};}

}

else
{
log.info("Return Due To Coupon Code Did Not Match with The 'SingleCouponCode' Key !");
return {ReturnValue : "100"}; // Because the Code Did Not Match !
} // END OF THE ELSE; 


}
else
{
// Else Return Error ("Due To Key Not Found")  :-
Revoke_SingleCouponCode_Item ();
log.info("Return Due To Key 'SingleCouponCode' Not Found !");
return {ReturnValue : "100"}; 
}


} // END OF THE FUNCTION !

//------------------------------------------------------------------------------------------------------


// Helper Method :-

function Revoke_SingleCouponCode_Item () // This Function Will Remove SingleCouponCode_Item If Any :-
{

var RevokeItemInstanceId = "No_ITEM_FOUND";

// Build Of Request :-
var GetUserInventoryRequest = {"PlayFabId": currentPlayerId};

// Submit Of Request :-
var GetUserInventoryResult  = server.GetUserInventory(GetUserInventoryRequest);


// Result :-

for(var Index in GetUserInventoryResult.Inventory)     
{


if(GetUserInventoryResult.Inventory[Index].ItemClass === "SingleCouponCode_Item")          
{

log.info("SingleCouponCode_Item Class Item Found !");

RevokeItemInstanceId = GetUserInventoryResult.Inventory[Index].ItemInstanceId;

} // END OF THE IF;

}


// RevokeInventoryItem If Any OR Return :-

if(RevokeItemInstanceId === "No_ITEM_FOUND")
{
log.info("No SingleCouponCode_Item Item Found In Client Inventory !");
return;
}


// Build Of Request :-
var RevokeInventoryItemRequest = {"PlayFabId": currentPlayerId , "ItemInstanceId": RevokeItemInstanceId};

// Submit Of Request :-
server.RevokeInventoryItem(RevokeInventoryItemRequest);

}

//#endregion

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#region InitZero And Helper Method's :-

// 100 == Month Not Found !
// 101 == Previous_Year_Last_Set Not Found !
// 102 == Circle Value Not Found !
// 103 == Error Found in Add_Utility_Data Method !

handlers.InitZero = function () // This Method will be called By Client , When the Client Start Zero or Reset Zero !
{

// Test :-
Update_Pin_Count ();

// JavaScript Date Time Variable Reference :- " https://www.w3schools.com/jsref/jsref_obj_date.asp ";

var Now = new Date (); 

var Current_Month = Now.getMonth();
var Current_Day   = Now.getDate();
var Current_Hour  = Now.getHours();
var Current_Min   = Now.getMinutes();

var Circle_1_V_Holder = "VNF"; // Value Not Found !
var Circle_2_V_Holder = "VNF";
var Circle_3_V_Holder = "VNF";

var ReturnObj = {}; // New JavaScript Obj !

ReturnObj = Return_Valid_Set (Current_Hour,Current_Day,Current_Month);

if(ReturnObj.hasOwnProperty("Error"))
{
ReturnObj = {};
ReturnObj.Error = 100;
return ReturnObj;
}


if
(
ReturnObj.Circle_1 === "undefined" ||
ReturnObj.Circle_2 === "undefined" ||
ReturnObj.Circle_3 === "undefined" ||
ReturnObj.Circle_4 === "undefined" 
)
{
ReturnObj = {};
ReturnObj.Error = 102; 
return ReturnObj;
}


Circle_1_V_Holder = ReturnObj.Circle_1;
Circle_2_V_Holder = ReturnObj.Circle_2;
Circle_3_V_Holder = ReturnObj.Circle_3;

ReturnObj = {};

//#region Packing Of Circle Value According To The Min:- 

// Refresh Of Min :-
Now = new Date ();

Current_Min = Now.getMinutes (); // (0-59);

if(Current_Min >= 15) // Then Circle 1 Will Be Packed !
{ReturnObj.Circle_1 = Circle_1_V_Holder}
else
{
// If This Is The Condition Then Return All Previous Set Value !
// Because The Client Is Waiting For The Circle 4 Result Of Previous Set !
ReturnObj = Return_Previous_Set ();
ReturnObj = Add_Utility_Data(ReturnObj);
return ReturnObj;
}

if(Current_Min >= 30) // Then Circle 2 Will Be Packed !
{ReturnObj.Circle_2 = Circle_2_V_Holder}

if(Current_Min >= 45 ) // Then Circle 3 Will Be Packed !
{ReturnObj.Circle_3 = Circle_3_V_Holder}

//#endregion

ReturnObj.H = Now.getHours();
ReturnObj.M = Now.getMinutes();

ReturnObj = Add_Utility_Data(ReturnObj);

return ReturnObj;

} // END OF THE FUNCTION !


//#region Helper Method :-

function Return_Previous_Set  () // This Function Will Return The Previous Set As A Java Obj !
{

var Now = new Date (); 

var Current_Month      = Now.getMonth();
var Current_Day        = Now.getDate ();
var Current_Hour       = Now.getHours();


var Previous_Year_Last_Set_Obj  = [];
var GetTitleInternalDataRequest = {};
var ReturnObj = {};

// Circumtance 1 :-
// Q : Will The Hour Stay in 24 Hour Or Not ?

Current_Hour = Current_Hour - 1; // Hour (00 - 23);

if(Current_Hour != -1) // Then Return The Previous Set Of The Current Day !
{
log.info("Hour Stay Within The 24 Hours !");
return Return_Valid_Set (Current_Hour,Current_Day,Current_Month);
}


// Circumtance 2 :-
// Q : Will The Day Stay Within Days 30 or 31 or 28 or 'Not' ?

Current_Day = Current_Day - 1; // (1 - 31) 

if(Current_Day != 0)
{
log.info("Day Stay Within The Days");
Current_Hour = 23; // Means Last Set !
return Return_Valid_Set (Current_Hour,Current_Day,Current_Month);
}


// Circumtance 3 :-
// Q : Will The Month Stay Within 12 Month ?

if(Current_Month === 00 || Current_Month === 0) {Current_Month = 0;}

Current_Month = Current_Month - 1; // (00 - 11)

if(Current_Month != -1)
{
log.info("Current Month Stay Within The Current 12 Months !");
Current_Hour = 23; // Means Last Set !
Current_Day  = null; // If Null Then Return_Valid_Set Will find The Last Day Of That Month !
return Return_Valid_Set (Current_Hour,Current_Day,Current_Month);
}

// Circumtance 4 :-

log.info("Current Month 'DOES NOT' Stay Within The Current 12 Months !");

GetTitleInternalDataRequest = {"Keys": ["Previous_Year_last_Set"]}

var GetTitleInternalDataResult = server.GetTitleInternalData(GetTitleInternalDataRequest);

if(GetTitleInternalDataResult.Data.hasOwnProperty("Previous_Year_last_Set") == false)
{
ReturnObj.Error = 101;
return ReturnObj;
}

Previous_Year_Last_Set_Obj = JSON.parse(GetTitleInternalDataResult.Data["Previous_Year_last_Set"]);

Now = new Date (); 

ReturnObj.H = Now.getHours(); // (0-23);
ReturnObj.M = Now.getMinutes(); // (0-59);

// Circle Values :-

ReturnObj.Circle_1 = Previous_Year_Last_Set_Obj.Circle_1;
ReturnObj.Circle_2 = Previous_Year_Last_Set_Obj.Circle_2;
ReturnObj.Circle_3 = Previous_Year_Last_Set_Obj.Circle_3;
ReturnObj.Circle_4 = Previous_Year_Last_Set_Obj.Circle_4;

log.info("Previous_Year_last_Set Circle_1 = " + ReturnObj.Circle_1);
log.info("Previous_Year_last_Set Circle_2 = " + ReturnObj.Circle_2);
log.info("Previous_Year_last_Set Circle_3 = " + ReturnObj.Circle_3);
log.info("Previous_Year_last_Set Circle_4 = " + ReturnObj.Circle_4);

return ReturnObj;

}

// Helper Method :-
function Return_Valid_Set  (GivenHour,GivenDay,GivenMonth)
{

var Now = new Date (); 

var GetTitleInternalDataRequest = {};

var Set_Key = "Set_";
var Given_MonthInWords = "";

var Main_JObj        = []; 
var Day_JObj         = [];
var Current_Set      = [];
var Set_Index_Runer  = 0;

var Circle_1_V_Holder = "undefined"; // Value Not Found !
var Circle_2_V_Holder = "undefined"; 
var Circle_3_V_Holder = "undefined";
var Circle_4_V_Holder = "undefined";

var ReturnObj = {};

if(GivenHour === 00 || GivenHour === 0) {GivenHour = 0;}


// Request :- 

// #region Build Of The Request According To The Current Month :- 

if(GivenMonth === 0 || GivenMonth === 00)
{
GetTitleInternalDataRequest = {"Keys": ["Jan"]}
Given_MonthInWords = "Jan";
}

if(GivenMonth === 1 || GivenMonth === 01)
{GetTitleInternalDataRequest = {"Keys": ["Feb"]}
Given_MonthInWords = "Feb";
}

if(GivenMonth === 2 || GivenMonth === 02)
{GetTitleInternalDataRequest = {"Keys": ["Mar"]}
Given_MonthInWords = "Mar";
}

if(GivenMonth === 3 || GivenMonth === 03)
{GetTitleInternalDataRequest = {"Keys": ["Apr"]}
Given_MonthInWords = "Apr";
}

if(GivenMonth === 4 || GivenMonth === 04)
{GetTitleInternalDataRequest = {"Keys": ["May"]}
Given_MonthInWords = "May";
}

if(GivenMonth === 5 || GivenMonth === 05)
{GetTitleInternalDataRequest = {"Keys": ["Jun"]}
Given_MonthInWords = "Jun";
}

if(GivenMonth === 6 || GivenMonth === 06)
{GetTitleInternalDataRequest = {"Keys": ["Jul"]}
Given_MonthInWords = "Jul";
}

if(GivenMonth === 7 || GivenMonth === 07)
{GetTitleInternalDataRequest = {"Keys": ["Aug"]}
Given_MonthInWords = "Aug";
}

if(GivenMonth === 8 || GivenMonth === 08)
{GetTitleInternalDataRequest = {"Keys": ["Sep"]}
Given_MonthInWords = "Sep";
}

if(GivenMonth === 9 || GivenMonth === 09)
{GetTitleInternalDataRequest = {"Keys": ["Oct"]}
Given_MonthInWords = "Oct";
}

if(GivenMonth === 10)
{GetTitleInternalDataRequest = {"Keys": ["Nov"]}
Given_MonthInWords = "Nov";
}

if(GivenMonth === 11)
{GetTitleInternalDataRequest = {"Keys": ["Dec"]}
Given_MonthInWords = "Dec";
}

//#endregion

// Submit of the Request :-


try 
{
var GetTitleInternalDataResult = server.GetTitleInternalData(GetTitleInternalDataRequest);
}
catch(e)
{
ReturnObj.Error = 100;
return ReturnObj;
}


if((GetTitleInternalDataResult.Data.hasOwnProperty(Given_MonthInWords)) === false)
{
log.info("Return Due To Key Not Found");
ReturnObj.Error = 100;
return ReturnObj;
}



Main_JObj = JSON.parse(GetTitleInternalDataResult.Data[Given_MonthInWords]); 

log.info("Total Days Of Month Test = " + Main_JObj.TotalDays);

//#region Fetch Of The Day !

if(GivenDay === null)  // Means Last Day !
{
log.info("GivenDay Was Null !");
GivenDay = Main_JObj.TotalDays;
}


for (i in Main_JObj.Days) 
{

if(Main_JObj.Days[i].Day == GivenDay ) // Then We Have To Remove That Day Obj And Store It In A JavaObj :-
{
Day_JObj = Main_JObj.Days[i]; // The Obj Is In Obj Form So No Need Of JSON.parse() Method !
}

}

//#endregion

//#region Fetch Of The Set :-

Set_Key = Set_Key + (GivenHour.toString()); // Eg :- "Set_" + 0 === "Set_0";

Current_Set = Day_JObj [Set_Key];

//#region  Circle Value Filler :-

Set_Index_Runer = 0;

for(I in Current_Set)
{

if(Set_Index_Runer === 0)
{
Circle_1_V_Holder = Current_Set[I];
}

if(Set_Index_Runer === 1)
{
Circle_2_V_Holder = Current_Set[I];
}

if(Set_Index_Runer === 2)
{
Circle_3_V_Holder = Current_Set[I];
}

if(Set_Index_Runer === 3)
{
Circle_4_V_Holder = Current_Set[I];
}

Set_Index_Runer = Set_Index_Runer + 1;
}

log.info("Return_Valid_Set Say :-")

log.info("GivenH = "+  GivenHour);
log.info("GivenD = "+  GivenDay);
log.info("GivenM = "+  GivenMonth);
log.info("GivenM_IW = "+  Given_MonthInWords);

log.info("Circle_1 = " + Circle_1_V_Holder);
log.info("Circle_2 = " + Circle_2_V_Holder);
log.info("Circle_3 = " + Circle_3_V_Holder);
log.info("Circle_4 = " + Circle_4_V_Holder);

log.info("Over !");

//#endregion

//#endregion

ReturnObj.H = Now.getHours (); // (0-23);
ReturnObj.M = Now.getMinutes (); // (0-59);

ReturnObj.Circle_1 = Circle_1_V_Holder;
ReturnObj.Circle_2 = Circle_2_V_Holder;
ReturnObj.Circle_3 = Circle_3_V_Holder;
ReturnObj.Circle_4 = Circle_4_V_Holder;

return ReturnObj;

}

// Helper Method :-
function Add_Utility_Data (GivenObj)
{

var GetTitleInternalDataRequest = {};

// Build Of The Request :-

GetTitleInternalDataRequest = {"Keys": ["Current_CC_Value","Previous_CC_Value"]};

// Submit Of The Request :-

try 
{
var GetTitleInternalDataResult = server.GetTitleInternalData(GetTitleInternalDataRequest);
}
catch(e)
{
GivenObj.Error = 100;
return GivenObj;
}

// Fill Of The Value :-

GivenObj.Current_CC_Value = GetTitleInternalDataResult.Data.Current_CC_Value;
GivenObj.Previous_CC_Value = GetTitleInternalDataResult.Data.Previous_CC_Value;

// Pin Stuff :-

var  Can_Client_Pin_Return_Obj  = Can_Client_Pin ();

GivenObj.Can_Client_Pin = Can_Client_Pin_Return_Obj.Can_Client_Pin;
GivenObj.Total_Pin = Can_Client_Pin_Return_Obj.Total_Pin;
GivenObj.Pin_Limit = Pin_Limit;

// CC_Updated :-

GivenObj = Attach_CC_Update (GivenObj);

// Return Of The Obj :-

return GivenObj;

}

//#endregion

//#endregion

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#region Pin's Recoder,Updater,Tracker,Taker Method's :-

function Can_Client_Pin ()
{

var Main_JObj = {}; // Json Obj !
var Now = new Date ();  

// Request :- 

var GetUserInternalData_Request = {"PlayFabId":currentPlayerId, "Keys": ["Pin_Info"]};

// Submit of the Request :-

var GetUserInternalData_Result =  server.GetUserInternalData (GetUserInternalData_Request);

if(GetUserInternalData_Result.Data.hasOwnProperty("Pin_Info") == false) {return {"Can_Client_Pin" : true,"Total_Pin":0}}

// Store Of The Obj :-

Main_JObj =  JSON.parse(GetUserInternalData_Result.Data["Pin_Info"].Value)

// Update Block :-
if(Main_JObj.Pin_Day != Now.getDate () || Main_JObj.Pin_Month != Now.getMonth () || Main_JObj.Pin_Year != Now.getFullYear ())
{

// Then Update To The Latest Value :-

Main_JObj.Pin_Day = Now.getDate (); // 1-31;
Main_JObj.Pin_Month = Now.getMonth (); // 0-11;
Main_JObj.Pin_Year = Now.getFullYear ();

Main_JObj.Total_Pin = 0;
Main_JObj.Can_Client_Pin = true;

// Update the Obj To The Server :-

var UpdateUserInternalData_Request = {
"PlayFabId": currentPlayerId,
"Data": {}
};

UpdateUserInternalData_Request.Data ["Pin_Info"] = JSON.stringify(Main_JObj);

server.UpdateUserInternalData(UpdateUserInternalData_Request);

}

if(Main_JObj.Total_Pin >= Pin_Limit) {return {"Can_Client_Pin" : false,"Total_Pin" : Main_JObj.Total_Pin}}
else
{
return {"Can_Client_Pin" : true,"Total_Pin" : Main_JObj.Total_Pin}
}

}

// The Update_Pin_Count Method Will Update The Pin Count Of The Client :-
function Update_Pin_Count ()
{

var Main_JObj = {}; // Json Obj !
var Now = new Date ();  

var GetUserInternalData_Request = {"PlayFabId":currentPlayerId, "Keys": ["Pin_Info"]};

// Submit of the Request :-

var GetUserInternalData_Result = server.GetUserInternalData (GetUserInternalData_Request);

// Json Data Creation Block :-
if(GetUserInternalData_Result.Data.hasOwnProperty("Pin_Info") == false) 
{
Main_JObj.Pin_Day = Now.getDate (); // 1-31;
Main_JObj.Pin_Month = Now.getMonth (); // 0-11;
Main_JObj.Pin_Year = Now.getFullYear ();

Main_JObj.Total_Pin = 0;
Main_JObj.Can_Client_Pin = true;    
}
else
{
// Else The Key Is Present With The Value So We Will Store It :-
// Store Of The Obj :-
Main_JObj = JSON.parse(GetUserInternalData_Result.Data["Pin_Info"].Value)
}

if(Main_JObj.Pin_Day != Now.getDate () || Main_JObj.Pin_Month != Now.getMonth () || Main_JObj.Pin_Year != Now.getFullYear ())
{

// Then Update To The Latest Value :-

Main_JObj.Pin_Day = Now.getDate (); // 1-31;
Main_JObj.Pin_Month = Now.getMonth (); // 0-11;
Main_JObj.Pin_Year = Now.getFullYear ();

Main_JObj.Total_Pin = 0;
Main_JObj.Can_Client_Pin = true;

// Update the Obj To The Server :-

}

Main_JObj.Total_Pin += 1;

if(Main_JObj.Total_Pin > Pin_Limit)
{
Main_JObj.Can_Client_Pin = false;
}
else
{
Main_JObj.Can_Client_Pin = true;   
}

var UpdateUserInternalData_Request = {
"PlayFabId": currentPlayerId,
"Data": {}
};
    
UpdateUserInternalData_Request.Data ["Pin_Info"] = JSON.stringify(Main_JObj);
    
server.UpdateUserInternalData(UpdateUserInternalData_Request);

}


// This Function Will Take Client Pin Number And CC :-

// Function Code's :-

// 100 = Pin Time Over! 
// 101 = Low CC!
// 102 = Invalid PinNumber Value!
// 103 = Invalid PinCC Value!
// 104 = Error occur!
// 105 = Sucessfull To Pin!

handlers.PinMyNumber = function (Arg) 
{

var Now = new Date (); 
var ReturnObj = {}; 
var Pin_History_Value = {};
var Current_Circle_OnGoing = 0;
var Current_UTC_Min = Now.getMinutes(); // (0 - 59 Min);
 
if(Arg.hasOwnProperty("PinNumber") == false) {ReturnObj.Error = 102; return ReturnObj;}

if(Arg.hasOwnProperty("PinCC") == false){ReturnObj.Error = 103; return ReturnObj;}

var PinNumber = Arg ["PinNumber"]; 
var PinCC = Arg["PinCC"]; 
var CC_Obj = {};

//#region InDepth Checking Stage :-

if(typeof PinNumber != 'number' || PinNumber < 0 || PinNumber > 9){ReturnObj.Error = 102; return ReturnObj;}

if(typeof PinCC != 'number' || PinCC < 0) {ReturnObj.Error = 103; return ReturnObj;}


// Check if The Given CC Is Minimum Or Equal To The Client Current CC , Less Then Current CC Then Return Error :- 


CC_Obj = Attach_CC_Update(CC_Obj)

if(!(CC_Obj.Current_Client_CC >= PinCC))
{
ReturnObj.Error = 101; // low cc !
return ReturnObj;
}
//#endregion

//#region Check if The Next Best Pin Time is Not Over if Over then Return Error :-

// Frist We Have To Check Which Circle Is Ongoing :- 

Current_Circle_OnGoing = 0;

if(Current_UTC_Min >= 0) {Current_Circle_OnGoing++;}
if(Current_UTC_Min >= 15){Current_Circle_OnGoing++;}
if(Current_UTC_Min >= 30){Current_Circle_OnGoing++;}
if(Current_UTC_Min >= 45){Current_Circle_OnGoing++;}

ReturnObj.Error = 100; // 100 = Pin Time Over !


if(Current_Circle_OnGoing == 1)
{
if(Current_UTC_Min >= 12){return ReturnObj;}   
}

if(Current_Circle_OnGoing == 2)
{
if(Current_UTC_Min >= 27){return ReturnObj;}   
}

if(Current_Circle_OnGoing == 3)
{
if(Current_UTC_Min >= 42){return ReturnObj;}   
}

if(Current_Circle_OnGoing == 4)
{
if(Current_UTC_Min >= 57 || Current_UTC_Min == 0){return ReturnObj;}   
}

//#endregion

// If The Client Bypass The Above Check Block Then The Client Is Allowed To Pin The Number :- 

ReturnObj = {}; // Reset The Obj Due To The Bypass Of Above Block !

// Build Of Server Request :- 

var GetUserInternalData_Request = {"PlayFabId":currentPlayerId, "Keys": ["Pin_History"]};

// Submit of the Request to the Server :-

var GetUserInternalData_Result =  server.GetUserInternalData (GetUserInternalData_Request);

if(GetUserInternalData_Result.Data.hasOwnProperty("Pin_History"))  // Then Store The Value :-
{
Pin_History_Value = JSON.parse(GetUserInternalData_Result.Data["Pin_History"].Value)
}

// Pin Bio :-

var Pin_Key = "Pin_";
var Pin_Value = {};

if(Pin_History_Value.length === undefined){Pin_Key = Pin_Key + "0"}
else
{
Pin_Key = Pin_Key + Pin_History_Value.length;
}


log.info("Pin_Key = " + Pin_Key + " !");

// Save Format :-Year/Month/Day/Set/PinCircle/CCWas/Value/CC :-

Pin_Value.PinNumber = PinNumber;
Pin_Value.PinCC = PinCC;

Pin_Value.PinYear  = Now.getFullYear();
Pin_Value.PinMonth = Now.getMonth();
Pin_Value.PinDay   = Now.getDate();
Pin_Value.PinSet   = Now.getHours() + 1; // (1-24 Set.)

// Upcoming_Circle :-

Current_Circle_OnGoing ++;
if(Current_Circle_OnGoing == 5){Current_Circle_OnGoing = 1;} 

Pin_Value.PinCircle = Current_Circle_OnGoing;
Pin_Value.CCWas = CC_Obj.Current_Client_CC;

// Update Of The Pin_History_Value With The Latest Pin :-
Pin_History_Value.Pin_Key = JSON.stringify(Pin_Value); 

// Update of the Final Change To the Server :-

// Build Of The Request :-
var UpdateUserInternalData_Request = {"PlayFabId": currentPlayerId,"Data": Pin_History_Value};
                
// Submit Of The Request To the Server :-
 var Result = server.UpdateUserInternalData(UpdateUserInternalData_Request);
    

if(Result) // If Sucessfull :-
{
    // Left;
// Then Attach The Pin History Data And Return To the Client :-
ReturnObj = Provide_ClientPinHistory();

ReturnObj.Result = 105; // Sucessful To pin !

// Return the Final Obj The client Device :-

return ReturnObj;

}

ReturnObj.Error = 104; // Error occur !
return ReturnObj;

} 


handlers.Provide_ClientPinHistory = function ()
{

var FinalObj = {};

// Attach CC Update :-
FinalObj = Attach_CC_Update (FinalObj);

return FinalObj;

}

//#endregion

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#region CC Releated Method's :-

function IssueClientCC  (IssuerID,TotalCC,AnnouncemetCode)
{

log.info("IssueClientCC Called With Following Parameter = " + IssuerID +","+ TotalCC +","+ AnnouncemetCode); 

var AddUserVirtualCurrencyRequest = {"PlayFabId":IssuerID,"VirtualCurrency": CC_Code ,"Amount":TotalCC};

var AddUserVirtualCurrencyResult  =  server.AddUserVirtualCurrency(AddUserVirtualCurrencyRequest);


if (AddUserVirtualCurrencyResult)
{
MakeAnnouncementPop_Up (IssuerID,AnnouncemetCode);
log.info (  IssuerID + " Issued " + AddUserVirtualCurrencyRequest.Amount + " " + CC_Code );
}

} 

// This Function Will Attach A CC Updated To The Called Method Return Obj And Return To The Client As CC Update:-
function Attach_CC_Update (ReturnObj)
{

// Build Of The Request :-
var GetUserInventoryRequest = {"PlayFabId" : currentPlayerId};

// Submit Of The Request To Server :-
var GetUserInventoryResult  = server.GetUserInventory(GetUserInventoryRequest);


// Attach CC To The Return Object :-

ReturnObj.Current_Client_CC = GetUserInventoryResult.VirtualCurrency["CC"].toString();

// Return The Object :-

return ReturnObj;


}

//#endregion

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#region Announcement And Helper Method's :-

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// [100  "ReferralCode Redeem Reward"             ] ;
// [101  "Invalid ReferralCode"                   ] ;
// [102  "ReferralConnected"                      ] ;
// [103  "Referral Process Completed Reward"      ] ;
// [104  "Client Has Exceded Max Referral"        ] ;
// [105  "Redeem Coupon Reward"                   ] ;
// [106  "Wellcome Bonus "                        ] ;


// This Method Store The Announcement :-

MakeAnnouncementPop_Up = function (AnnouncementOn,Code)
{

var MainKey                = "Announcement"; // KEY;
var MainKey_Value          =  []; // ARRAY;          
var ChangeValue            =  "NC";       
var PushValue              =  "NC";
var UserName               = "MR/Miss";


if(Code == null || Code  === undefined || Code  === "" || Code < 100)
{
log.error("Invalid Announcement Code = " + Code + " !");
return;
}

if(Code  == 102 || Code  === 103 ) // "ReferralConnected and Referral Process Completed Reward" !
{

var GetClientAccountInfoRequest = null;

GetClientAccountInfoRequest     = {"PlayFabId":currentPlayerId};

try 
{
var GetClientAccountInfoResult  = server.GetUserAccountInfo (GetClientAccountInfoRequest);
}
catch(e)
{
return;
}

UserName = GetClientAccountInfoResult.UserInfo["Username"];

}

switch (Code)
{
case 100:
ChangeValue = ReferralCodeRedeemReward; 
break;

case 102:
ChangeValue = UserName;
break;

case 103:
ChangeValue = ReferrerReward +"_"+ UserName;
break;

default:
ChangeValue = "NC";   // "NC" Means No Change ! 
break;   
}




if(Code == 100 || Code === 103 || Code === 105 || Code === 106) // Add more code which need changevalue;
{

var GetUserInventoryRequest = {"PlayFabId" : AnnouncementOn};

var GetUserInventoryResult  = server.GetUserInventory(GetUserInventoryRequest);


if(GetUserInventoryResult)
{

if(ChangeValue == "NC") // Means NO Change !
{
ChangeValue = GetUserInventoryResult.VirtualCurrency["CC"];
}
else
{
ChangeValue =  ChangeValue +"_" + GetUserInventoryResult.VirtualCurrency["CC"];
}

}

} // END OF THE MAIN IF; 


if(ChangeValue === "NC")
{
PushValue = Code;
}
else 
{
PushValue = Code + "_" + ChangeValue;
}

var GetUserPublisherDataRequest =  {
"PlayFabId": AnnouncementOn ,
"Keys": [MainKey]
}; 


var GetUserPublisherDataResult  =  server.GetUserPublisherData (GetUserPublisherDataRequest);

if
(!(GetUserPublisherDataResult.Data.hasOwnProperty(MainKey)) )

{

MainKey_Value.push (PushValue);

}
else 
{
        
MainKey_Value = JSON.parse(GetUserPublisherDataResult.Data[MainKey].Value);


if(Array.isArray(MainKey_Value ))
{
    
MainKey_Value.push(PushValue);

}
else  
{
log.error("Announcement Value Not In Array Form !");
return;
}

} // END OF THE MAIN ELSE; 



var UpdateUserPublisherDataRequest = {
"PlayFabId": AnnouncementOn,
"Data": {}
};


UpdateUserPublisherDataRequest.Data [MainKey] = JSON.stringify(MainKey_Value);


var Result = server.UpdateUserPublisherData(UpdateUserPublisherDataRequest);

if(Result) 
{
log.info("Sucessfully Made Announcement On : " + AnnouncementOn);
log.info("Final PushValue = " + PushValue); 
}

} // END OF THE METHOD; 


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


handlers.ReleseCurrentAnnouncement = function ()  // This Function Will Be Called By The Client To Retrive Announcement If Any !
{

var MainKey       = "Announcement";
var MainKey_Value = "NullValue";

var GetUserPublisherDataRequest =  {
"PlayFabId": currentPlayerId ,
"Keys": [MainKey]
}; 


var GetUserPublisherDataResult  =  server.GetUserPublisherData (GetUserPublisherDataRequest);


if (! (GetUserPublisherDataResult.Data.hasOwnProperty(MainKey)))
{
return {ReturnValue : "NOANNOUNCEMENT"}; }  // Return if not found !

MainKey_Value = GetUserPublisherDataResult.Data [MainKey].Value;


var UpdateUserPublisherDataRequest = {
"PlayFabId": currentPlayerId,
"Data": {}
};

UpdateUserPublisherDataRequest.Data [MainKey] = null;  // Null Means Remove that key from Client PublisherData !

var UpdateUserPublisherDataResult = server.UpdateUserPublisherData(UpdateUserPublisherDataRequest);

if(UpdateUserPublisherDataResult)
{
return {ReturnValue : MainKey_Value}; 
}


} // END OF THE METHOD !


//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#endregion

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//#region Direct Action Method's :-

function TerminateClientFromZero () // This Function Will Delete The Client Account.   
{

var DeleteRequest               = null; // Request !
var UpdateTotalClientTerminated = null; // Request !

var TTC                         = 0; // Total Terminated Client !

DeleteRequest                   = {"PlayFabIds": [currentPlayerId],"TitleId": "EEC8"};

var GetTitleDataRequest         = {"Key": ["TotalTerminatedClient"]}; 

var GetTitleDataResult          = server.GetTitleData(GetTitleDataRequest);

TTC                             = GetTitleDataResult.Data["TotalTerminatedClient"];

TTC                             = TTC + 1;

UpdateTotalClientTerminated     = {"Key": "TotalTerminatedClient","Value": TTC};

// Server Request :-

server.SetTitleData(UpdateTotalClientTerminated);

server.DeleteUsers(DeleteRequest);

} // END OF THE FUNCTION !

//#endregion
