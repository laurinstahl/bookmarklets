javascript: (function() {
	//verschiedene Konstanten
	var hostname='experience.aiesec.org';
	var locationHashStart='#/people/';
	var locationHashEnd='/applications';
	var wrongPageErrorMessage="Wrong Page!";

	//globale Variablenm, welche funktionsübergreifend gebraucht werden
	var applicationCount=100;
	var pageNumber=1;
	
	/*Das ist DIE Methode die das eigentliche Programm darstellt */
	function main(){
		//check ob die url/seite die richtige ist
		if(checkRightLocation()) {
			var personId=angular.element($('div.ng-scope')).scope().vm.id;
			var personCall=Utils.getPerson(personId);
			var applicationCall=Utils.getApplicationsOfPerson(personId,applicationCount,pageNumber);
			//console.log(epName);

			waitForRequest(personCall, applicationCall, function(person, applications){
			

				console.log(person);
				console.log(applications);
				var applicationsOfPerson=applications[0].data;
				var personData=person[0];

				//lösche alle unnötigen Dinge auf der Seite
				cleanPage();
				addEmptyTable();
				addTableHeadlines();
				//Holt die einzelnen Applications per ajax call und fügt sie per jquery in die leere tabelle ein
				fillTable(applicationsOfPerson, personData);
			});
			
						
		} else {
			alert(wrongPageErrorMessage);
		}
	}

	function addEmptyTable(){
		$("div.crm-list").append("<table style='color:#777' class='bookmarklet'><tbody class='bookmarklet'></tbody></table>");
	}


	
	/*Bereinigt die Seite per JQuery von unnötigen Elementen*/
	function cleanPage(){
		$("ul.list").css('display', 'none');
		$("table.bookmarklet").remove();
	
		$("aside.sidebar").remove();
		$("a.bulk-edit.align-right.ng-scope").remove();
		
		$("span.number-of-results.ng-binding").empty();
		$("span.number-of-results.ng-binding").append("<strong style= 'font-weight: bold; color: #3692E0;'>only open</strong> applications");
	}
	
	function fillTable(applications, person){		
		for(var j = 0; j < applications.length; j++) {
			Utils.getOpportunity(applications[j].opportunity.id, createTableRow(person, applications[j]));
		}
	}
	
	
	function createTableRow(person, application){		
		return function(opportunity) {
			
			var html=$("tbody.bookmarklet").html();
			console.log(application.id + ": s-" + application.status + ", c-" + application.current_status);
			if (application.current_status == "open") {
				html+='<tr class="application bookmarklet">';
				html+=" <td>" + person.full_name + "</td>";
				html+=" <td>" + person.id + "</td>";
				html+=addApplicationDate(application);
				html+=addOpportunityTitle(application);
				html+=addTnId(application);
				html+=addTnManager(opportunity);
				html+=addTnEmail(opportunity);
				html+=addStatus(application);
				html+="</tr>";
			}
			$("tbody.bookmarklet").html(html);
		}
	}
	
	function addTableHeadlines() {
		var html=$("tbody.bookmarklet").html();
		
		html+='<tr style="font-weight:bold;"> <th>';
		html+="EP Name</th><th>";
		html+="EP ID</th><th>";
		html+="Application Date</th><th>";
		html+="TN Name</th><th>";
		html+="TN ID</th><th>";
		html+="TN Manager</th><th>";
		html+="TN Manager e-mail</th><th>";
		html+="Status</th>"
		html+="</tr>";

		$("tbody.bookmarklet").html(html);
	}
	
	function addApplicationDate(application){	
		var date =Utils.formatDate(application.created_at);
		return '<td class="bookmarklet">'+
				'<p>'+date+'</p>'+
				'</td>';
	}

	function addOpportunityTitle(application){	
		return '<td class="bookmarklet">'+
				'<p>'+application.opportunity.title+'</p>'+
				'</td>';
	}

	function addTnId(application){	
		return '<td class="bookmarklet">'+
				'<p>'+application.opportunity.id+'</p>'+
				'</td>';
	}

	function addTnManager(opportunity) {
		return '<td class="bookmarklet">'+
				'<p>'+opportunity.managers[0].full_name+'</p>'+
				'</td>';
	}

	function addTnEmail(opportunity) {
		return '<td class="bookmarklet">'+
				'<p>'+opportunity.managers[0].email+'</p>'+
				'</td>';

	}

	function addStatus(application){	
		return '<td class="bookmarklet">'+
				'<div class="stage-actions">'+
					'<div class="status-container">'+
						'<span class="status '+application.current_status+'">'+application.current_status+'</span>'+
					'</div>'+
				'</div>'+
			'</td>';
	}	

	//Check ob man auf der Seite https://experience.aiesec.org/#/people/XXXXXX/applications ist, erzeugt die Tabelle und zeigt diese an
	function checkRightLocation(){
		return window.location.hostname == hostname && Utils.stringStartsWith(window.location.hash,locationHashStart) && Utils.stringEndsWith(window.location.hash,locationHashEnd);
	}
	//########################################################
	function Utils(){}
	
	//diverse Status die eine Application besitzen kann
	Utils.matchedStatus='matched';
	Utils.rejectedStatus='rejected';
	Utils.withDrawnState='withdrawn';
	Utils.realizedState='realized';
	Utils.openState='open';
	Utils.tokenName='expa_token';
	Utils.securityToken=null;

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
	
	/*Deklarierung einer asynchronen Methode, welche alle Bewerbungen zurück gibt*/
	Utils.getApplication=function (applicationId,successFunction) {
		return $.get("https://gis-api.aiesec.org/v2/applications/"+applicationId+".json?access_token="+Utils.getSecurityToken(), successFunction);
	}
	
	/*Deklarierung einer asynchronen Methode, welche alle Bewerbungen zurück gibt*/
	Utils.getApplicationsOfPerson=function (personId,elementCount,pageNumber,successFunction) {
		return $.get("https://gis-api.aiesec.org/v2/people/"+personId+"/applications.json?access_token="+Utils.getSecurityToken()+"&page="+pageNumber+"&per_page="+elementCount,  successFunction);
	}

	/*Deklarierung einer Methode zum Formatieren eines Datums*/
	Utils.formatDate=function (dateString) {
		var d = new Date(dateString);
		return d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear();
	}	

	/*Deklarierung einer asynchronen Methode, welche die Person mir der übergebenen ID zurück gibt*/
	Utils.getPerson=function (id,successFunction) {
		return $.get("https://gis-api.aiesec.org/v2/people/"+id+".json?access_token="+Utils.getSecurityToken(),successFunction);
	}
	
		/*Deklarierung einer asynchronen Methode, welche die Person mir der übergebenen ID zurück gibt*/
	Utils.getOpportunity=function (id,successFunction) {
		return $.get("https://gis-api.aiesec.org/v2/opportunities/"+id+".json?access_token="+Utils.getSecurityToken(), successFunction);
	}

	Utils.stringStartsWith=function (string, prefix) {
		return string.slice(0, prefix.length) == prefix;
	}
	
	Utils.stringEndsWith=function (string, suffix) {
		return string.indexOf(suffix, string.length - suffix.length) !== -1;
	}

	/*Wartet auf die übergebenen ajax calls und ruft danach die übergebene whenFunction auf*/
	function waitForRequest(call1,call2,whenFunction){
		$.when(call1,call2).then(whenFunction);
	}
	//########################################################
	//führt die main methode aus
	main();

})();