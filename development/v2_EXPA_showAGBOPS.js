javascript: (function(){

		var db_token = "Token For Your Own Rest API Database";

		//########################################################
		function Utils(){}
		Utils.securityToken=null;
		Utils.tokenName='expa_token';

		/*Deklarierung einer Methode, welche das SecurityToken aus den Cookies liest*/
		Utils.readSecurityToken=function () {
			var cookieContent;
			var search_for = Utils.tokenName+"=";
			var cookies = document.cookie.split(';');
			for(var i = 0; i < cookies.length; i++) {
				var c = cookies[i];
				while (c.charAt(0) == ' '){
					c = c.substring(1, c.length);
				}
				if (c.indexOf(search_for) == 0) {
					cookieContent = decodeURIComponent(c.substring(search_for.length,c.length));
				}
			}
			return cookieContent;
		}

		Utils.getSecurityToken=function () {
			if(Utils.securityToken===null){
				Utils.securityToken=Utils.readSecurityToken();
			}
			return Utils.securityToken;
		}
		Utils.getAGBInformation=function(ep_id,exchangeID,successFunction){
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/agbAgreements?exchange="+exchangeID+"&access_token="+db_token, async: false}).responseText;
			json = JSON.parse(call);
			return json;
		}
		Utils.getFinanceInformation=function(ep_id,exchangeID,successFunction){
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges/"+exchangeID+"/financeInformation?access_token="+db_token, async: false}).responseText;
			json = JSON.parse(call);
			return json;
		}

		/*Deklarierung einer asynchronen Methode, welche die Person mir der übergebenen ID zurück gibt*/
		Utils.getExchange=function (ep_id,app_id,successFunction) {
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges?access_token="+db_token+"&applicationID="+app_id+"&page=1&limit=1", async: false}).responseText;
			//parses for total items, if > 0, exchange object exists
			json = JSON.parse(call);
			return json;
		}
		Utils.getExchanges=function (ep_id,successFunction) {
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges?access_token="+db_token+"&page=1&limit=1", async: false}).responseText;
			//parses for total items, if > 0, exchange object exists
			json = JSON.parse(call);
			return json;
		}
		Utils.exchangeExists=function (ep_id,app_id,successFunction) {
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"/exchanges?access_token="+db_token+"&applicationID="+app_id+"&page=1&limit=1", async: false}).responseText;
			//parses for total items, if > 0, exchange object exists
			json = JSON.parse(call);
			return json;
		}
		Utils.getPerson=function (ep_id,successFunction) {
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/people/"+ep_id+"?access_token="+db_token+"", async: false}).responseText;
			//parses for total items, if > 0, exchange object exists
			json = JSON.parse(call);
			return json;
		}
		Utils.getOP=function (ep_id,successFunction) {
			var call = $.ajax({type: "GET", url: "https://noob.aiesec.de/outgoerPreparationParticipations?person="+ep_id+"&access_token="+db_token+"&page=1&limit=10", async: false}).responseText;
			//parses for total items, if > 0, exchange object exists
			json = JSON.parse(call);
			return json;
		}

		//########################################################

		function main() {
			var url = window.location.href;
			var id = url.split("/");
			id = id[5];
			ep_id = id;
			//get OPS Information
			//find out whether OPS Online is done
			var person = Utils.getPerson(ep_id);
			var opsOnline = person.opsOnline;
			var opsOnlineBookingDate = person.opsOnlineBookingDate;
			if(typeof opsOnlineBookingDate == "string"){
				var ops = "OPS Online Confirmed";
			}
			else{
				var opsPhys = Utils.getOP(ep_id);
				if(opsPhys.totalItems == 0){
					var ops = "No OPS Confirmed";
				}
				else{
					var opsPhysCon = opsPhys.payload[0].confirmed;
					if(typeof opsOnlineBookingDate == "object"){
						var ops = "No OPS Confirmed";
					}
					else{
						var ops = "OPS Confirmed";
					}
				}
			}
			$("#OPS").remove();
			$(".action-paid").eq(3).after("<li id='OPS' class='action-ep-manager'><div class='inner ng-isolate-scope'><span class='ng-binding'>"+ops+"</span></div></li></div>");
			
			//Show exchanges
			var exchanges = Utils.getExchanges(ep_id);
			exchanges = exchanges.payload;
			for(var i=0;i<exchanges.length;i++){
				if(exchanges[i].applicationID == null){
					exchangeID = exchanges[i].id;
					var finance = call = Utils.getFinanceInformation(ep_id,exchangeID);
					inpaymentBooked = finance.inpaymentBooked;
					if(inpaymentBooked == true){
						var booked = "Yes";
					}
					else{
						var booked = "No";
					}
					var AGB = call = Utils.getAGBInformation(id,exchangeID);
					console.log(AGB);
					if(AGB.totalItems == 0){
						var agbs = "not signed";
					}
					else{
						var dateSigned = AGB.payload[0].dateSigned;
						dateSigned = dateSigned.split("T");
						dateSigned = dateSigned[0];
						var agbs = "signed on "+dateSigned;
					}
					//prepend
					$('#'+exchangeID).remove();
					$('ul.list li.application').eq(0).before("<li class='application' id='"+exchangeID+"'><div class='general align-left'><div class='general-inner-2'>Exchange: <a>"+exchangeID+"</a>  &nbsp;  Inpayment Booked: <a>"+booked+"</a>  &nbsp;  AGBs <a>"+agbs+"</a></></div></div></li>");
					
				}
				
			}				

			var application = angular.element(jQuery('ul.list')).scope().vm.applications;
			for(var i=0;i<application.length;i++){
				//define app and ep id
				var app = application[i];
				var app_id  = app.id;
				ep_id = id;
				//check if internship is TMP/GCDP/GIP
				var opp = app.opportunity;
				if(!opp){	//counteracting an EXPA bug
					continue;
				}
				//check if exchange exists from person and application id
				var call = Utils.exchangeExists(id,app_id);
				totalItems = call.totalItems;
				//if(totalItes > 0, exchangeExists)
				if(totalItems > 0){
					//get exchange id
					exchangeID = call.payload[0].id;
					//get AGB status
					var AGB = call = Utils.getAGBInformation(id,exchangeID);
					if(AGB.totalItems == 0){
						var agbs = "AGBs not signed";
					}
					else{
						var dateSigned = AGB.payload[0].dateSigned;
						dateSigned = dateSigned.split("T");
						dateSigned = dateSigned[0];
					}
					//getFinanceInfo
					var finance = call = Utils.getFinanceInformation(id,exchangeID);
					inpaymentBooked = finance.inpaymentBooked;
					if(inpaymentBooked == true){
						var booked = "Yes";
					}
					else{
						var booked = "No";
					}
					$(".agbSigned").empty();
					$(".general-inner").eq(i).append("<div class='agbSigned'>AGB signed: "+dateSigned+"</div>");
					$(".Booked").empty();
					$(".align-right").eq(i).prepend("<span class='Booked'>Inpayment booked: "+booked+" &nbsp;</span>");
				}

			}

		}

		main();




		//create CREATE EXCHANGE Buttons
		//var zeile =




	}
)();