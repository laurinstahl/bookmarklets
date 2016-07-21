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
//		if(checkRightLocation()) {

		cleanPage();
		addFavoriteTitle();
		addEmptyTable();
		addHeader();
		var favoritesCall = Utils.getFavorites(addFavorites);			
						
	//	} else {
	//		alert(wrongPageErrorMessage);
	//	}
	}

	function addEmptyTable(){
		$("div.favorite-title").append("<table style='color:#777' border='1' class='favorites'><tbody class='favorites'></tbody></table>");
	}

	
	function cleanPage(){
		$("div.favorite-title").remove();
		$("table.favorites").remove();
	}
	
	function addFavoriteTitle() {
		$("div.applications-section").append("<div class='favorite-title'><h1 style='color:black;'>Your Favorites</h1></div>");
	}

	function addHeader() {
		var html=$("tbody.favorites").html();
		html+='<tr style="font-weight:bold;"> <th>';
		html+="ID</th><th>";
		html+="Title</th>";
		html+="</tr>";

		$("tbody.favorites").html(html);
	}

	function addFavorites(data) {
		console.log(data);

		for(var i = 0; i < data.length; i++) {
			if(data[i].is_favourited == true) {
				
				$("tbody.favorites").append("<tr><td style='padding:5px;'>" 
					+ data[i].id 
					+ "</td><td style='padding:5px;'><a href='https://internships-v1.aiesec.org/#/professional/"
					+ data[i].id
					+"/'>" 
					+ data[i].title 
					+ "</a></td></tr>");
			}
		}
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
	Utils.tokenName='op_token';
	Utils.securityToken=null;




	/*Deklarierung einer asynchronen Methode, welche die Opportunites zurück gibt*/
	Utils.getFavorites=function (successFunction) {
		var cookies = document.cookie.split(';');
		var search_for = "op_token=";
		var Cvalue;
		for(var i = 0; i < cookies.length; i++) {
			var c = cookies[i];
			while (c.charAt(0) == ' ') c = c.substring(1, c.length);
			if (c.indexOf(search_for) == 0) Cvalue = decodeURIComponent(c.substring(search_for.length,c.length));
		}

		var token = JSON.parse(Cvalue).token.access_token;
		return $.get("https://gis-api.aiesec.org/v1/opportunities/favourite.json?access_token="+token, successFunction);
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