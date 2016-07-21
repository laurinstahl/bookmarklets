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
			var zeile = $("<div style='color: #777;width: 100%;height:30px!important;padding: 12px 15px;background: #fafafa;border-top: 1px rgba(0, 0, 0, .15) solid;border-bottom: 1px rgba(0, 0, 0, .15) solid;'><div id='rowHeader'></div></div>").insertBefore($('ul.list li.application').eq(0));
			document.getElementById('rowHeader').innerHTML = "";
			var zeile = $("<table id='table'></table>").appendTo($('#rowHeader'));
			var zeile = $("<tr id='tr'></tr>").appendTo($('#table'));
			var zeile = $("<td id='id'>EXPA ID</td>").appendTo($('#tr'));
			var zeile = $("<td id='firstName'>First Name</td>").insertAfter($('#id'));
			var zeile = $("<td id='lc'>LC</td>").insertAfter($('#firstName'));
			var zeile = $("<td id='realizeDate'>Realize Date</td>").insertAfter($('#lc'));
			var zeile = $("<td id='program'>Program</td>").insertAfter($('#realizeDate'));
			var zeile = $("<td id='opsDate'>OPS Date</td>").insertAfter($('#program'));
			var zeile = $("<td id='agbDate'>AGB Date</td>").insertAfter($('#opsDate'));





			//go through all applications
			var application = angular.element($('ul.list')).scope().vm.applications;
			for(var i=0;i<application.length;i++){
				var ep_id = application[i].person.id;
				var first_name = application[i].person.first_name;
				var last_name = application[i].person.last_name;
				var app_id = application[i].id;
				//var call = Utils.getApplication(app_id);
				//json = JSON.parse(call);
				//var realizeDate = json.meta.date_realized;
				//get OPS Data from NOOB
				//get AGB Data from NOOB
				//get Opportunity Program
				//get LC (ID?)

				$(".application").eq(i).empty();
				var zeile = $("<div id='tr_"+i+"'></div>").insertAfter($('#tr'));
				var zeile = $("<div id='td_"+i+"+id'>EXPA ID:"+i+"</div>").appendTo($('#tr_'+i));

			}





		}


		main();

	}
)();