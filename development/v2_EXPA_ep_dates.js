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

			Utils.getApplicationsOfPerson(personId,applicationCount,pageNumber,function(data){
				var applicationsOfPerson=data.data;
				//lösche alle unnötigen Dinge auf der Seite
				cleanPage();
				addEmptyTable();
				addTableHeadlines();
				//Holt die einzelnen Applications per ajax call und fügt sie per jquery in die leere tabelle ein
				fillTable(applicationsOfPerson);
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
		$("span.number-of-results.ng-binding").append("all applications");
	}
	
	function fillTable(applicationsOfPerson){		
		for(var j = 0; j < applicationsOfPerson.length; j++) {
			Utils.getApplication(applicationsOfPerson[j].id,createTableRow);
		}
	}
	
	function addTableHeadlines() {
		var html=$("tbody.bookmarklet").html();
		
		html+='<tr style="font-weight:bold;"> <th>';
		html+="TN Name</th><th>";
		html+="Legal dates</th><th>";
		html+="Raw dates</th><th>";
		html+="Status</th>";
		html+="</tr>";

		$("tbody.bookmarklet").html(html);
	}

	function createTableRow(application){		
		var html=$("tbody.bookmarklet").html();
		
		html+='<tr class="application bookmarklet">';
		html+=addOpportunityTitle(application);
		html+=addApplicationInfosLegal(application);
		html+=addApplicationInfosRaw(application);
		html+=addStatus(application);
		html+="</tr>";

		$("tbody.bookmarklet").html(html);
	}
	
	
	function addApplicationInfosRaw(app,row){	
		var html="";

		if(app.created_at != null)
			html += "<u>Applied: </u> " + Utils.formatDate(app.created_at);
		if(app.matched_or_rejected_at != null && app.current_status == 'rejected')
			html += "<br /><u>Rejected: </u> " + Utils.formatDate(app.matched_or_rejected_at);
		else if(app.matched_or_rejected_at != null && app.current_status != 'withdrawn')
			html += "<br /><u>unofficial match: </u> " + Utils.formatDate(app.matched_or_rejected_at);
		if(app.an_signed_at != null){
			html += "<br /><u>AN:</u> " + Utils.formatDate(app.an_signed_at);
		} else {
			html += "<br /><u>XP:</u> not started"
		}	        				
		if(app.meta.date_withdrawn != null)
			html += "<br /><u>withdrawn: </u> " + Utils.formatDate(app.meta.date_withdrawn);
		if(app.meta.date_ep_approved != null)
			html += "<br /><u>Approved: </u><br>EP: " + Utils.formatDate(app.meta.date_ep_approved);
		if(app.meta.date_approved != null)
			html += "<br>TN: " + Utils.formatDate(app.meta.date_approved);
		if(app.meta.date_realized != null)
			html += "<br /><u>Realized: </u> " + Utils.formatDate(app.meta.date_realized);
		if(app.experience_start_date != null) {
			html += "<br /><u>XP:</u> " + Utils.formatDate(app.experience_start_date) + " - ";
			if(app.experience_end_date != null) {
				html += Utils.formatDate(app.experience_end_date);
			} else {
				html += "...";
			}
		}
		return  '<td class="bookmarklet">'+html+'</td>';
	}
	
	function addApplicationInfosLegal(application){
		var html="";
		
		if(application.matched_or_rejected_at != null && application.current_status == Utils.rejectedStatus){
			html+="<br />Rejected ";
		}else if(application.meta.date_withdrawn != null && application.current_status == Utils.withDrawnState){
			html+= "<br />Withdrawn ";
		}else if((application.current_status == Utils.matchedStatus || application.current_status == Utils.realizedState) && application.matched_or_rejected_at != null && application.an_signed_at != null && application.meta.date_approved != null) {
			var ma = new Date(application.an_signed_at);
			if(ma < new Date(application.meta.date_approved)){
				ma = new Date(application.meta.date_approved);
			}
			if(ma < new Date(application.matched_or_rejected_at)){
				ma = new Date(application.matched_or_rejected_at);
			}
			html += "<br /><b style='font-weight:bold;'>legal match: </b> " + Utils.formatDate(ma);
		} else {
			html += "<br /><b style='font-weight:bold;'>legal not matched</b>";
		}
		
		return '<td class="bookmarklet">'+html+'</td>';
	}	

	function addOpportunityTitle(application){	
		return '<td class="bookmarklet">'+
				'<div class="general-inner">'+
					'<div class="general-top">'+
						'<a href="'+'#/opportunities/'+application.opportunity.id+'" class="name ng-binding">'+application.opportunity.title+'</a>'+
					'</div>'+
					'<div>'+
						'<span class="applications-closing-date ng-scope ng-binding" data-title="Applications closing date" bs-tooltip="">'+Utils.formatDate(application.opportunity.applications_close_date)+'</span>'+
					'</div>'+
				'</div>'+
			'</td>';
	}

	function addStatus(application){	
		return '<td class="bookmarklet">'+
				'<div class="stage-actions">'+
					'<div class="status-container">'+
						'<span class="status '+application.status+'">'+application.status+'</span>'+
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
	
	Utils.stringStartsWith=function (string, prefix) {
		return string.slice(0, prefix.length) == prefix;
	}
	
	Utils.stringEndsWith=function (string, suffix) {
		return string.indexOf(suffix, string.length - suffix.length) !== -1;
	}
	//########################################################
	//führt die main methode aus
	main();

})();