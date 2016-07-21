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
	Utils.getPerson=function (id,successFunction) {
		return $.get("https://gis-api.aiesec.org/v2//people/"+id+".json?access_token="+Utils.getSecurityToken(),successFunction);
	}

	//########################################################
	
	
	function main() {
		removeAllLocations();
		
		var user = angular.element(jQuery('ul.list')).scope().vm.people;
		for(var i=0;i<user.length;i++){
			var call=Utils.getPerson(user[i].id,addLocationToPerson(i));
		}
	}
	
	function removeAllLocations() {
		$('div.preferred_locations').remove();
		$('img.avatar').remove();

	}
	
	function addLocationToPerson(rowIndex) {
		return function(data){
				var zeile = $("<div class='preferred_locations align-left' style='font-size: x-small; text-transform: uppercase;'></div>").insertAfter($('ul.list li.person div.ep-managers').eq(rowIndex));
				
				if(data.profile != null) {
					if(data.profile.preferred_locations_info.length != 0) {
						zeile.append("<strong style= 'font-weight: bold;'>Preferred location:</strong><br>");
						for(var i = 0; i<data.profile.preferred_locations_info.length; i++) {
							if(data.profile.preferred_locations_info[i].name == "AIESEC INTERNATIONAL") {
								zeile.append("No preferences <br>");
								break;
							} else {
								zeile.append(data.profile.preferred_locations_info[i].name + "<br>");
							}
						}
						zeile.append(" </div>");
					}
				}
		};
	}
	
	main();
	
}
)();