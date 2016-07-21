javascript: (function(){
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

	/*Deklarierung einer asynchronen Methode, welche die Person mir der übergebenen ID zurück gibt*/
	Utils.getApplication=function (id,successFunction) {
		return $.ajax({type: "GET", url: "https://gis-api.aiesec.org/v2/applications/"+id+".json?access_token="+Utils.getSecurityToken(), async: false}).responseText;
	}

	//########################################################

	
	function main() {
		//remove all comments
		$('*').contents().each(function() {
			if(this.nodeType === Node.COMMENT_NODE) {
				$(this).remove();
			}
		});
		//add table header
		var zeile = $("<div style='color: #777;width: 100%;height:50px!important;padding: 12px 15px;background: #fafafa;border-top: 1px rgba(0, 0, 0, .15) solid;border-bottom: 1px rgba(0, 0, 0, .15) solid;'><div id='rowHeader'></div></div>").insertBefore($('ul.list li.application').eq(0));
		document.getElementById('rowHeader').innerHTML = "";
		var zeile = $("<div id='id' style='float:left;width:130px;'>EXPA ID</div>").appendTo($('#rowHeader'));
		var zeile = $("<div id='firstName' style='float:left;width:130px;'>First Name</div>").insertAfter($('#id'));
		var zeile = $("<div id='lc' style='float:left;width:130px;'>LC</div>").insertAfter($('#firstName'));
		var zeile = $("<div id='realizeDate' style='float:left;width:130px;'>Realize Date</div>").insertAfter($('#lc'));
		var zeile = $("<div id='program' style='float:left;width:130px;'>Program</div>").insertAfter($('#realizeDate'));
		var zeile = $("<div id='opsDate' style='float:left;width:130px;'>OPS Date</div>").insertAfter($('#program'));
		var zeile = $("<div id='agbDate' style='float:left;width:130px;'>AGB Date</div>").insertAfter($('#opsDate'));

		//go through all applications
		var application = angular.element($('ul.list')).scope().vm.applications;
		for(var i=0;i<application.length;i++){
			var ep_id = application[i].person.id;
			var first_name = application[i].person.first_name;
			var last_name = application[i].person.last_name;
			var app_id = application[i].id;
			var call = Utils.getApplication(app_id);
			json = JSON.parse(call);
			var realizeDate = json.meta.date_realized;
			//get OPS Data from NOOB
			//get AGB Data from NOOB
			//get Opportunity Program
			//get LC (ID?)

			$(".application").eq(i).empty();
			var zeile = $("<div id='app_"+i+"+id' style='float:left;width:150px;'>EXPA ID:"+i+"</div>").appendTo($('li.application').eq(i));
		}





	}

	
	main();
	
}
)();