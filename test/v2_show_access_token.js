javascript: (function(){
	//########################################################
	function Utils(){}
	Utils.securityToken=null;
	Utils.tokenName='expa_token';
	
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
		var superToken = Utils.getSecurityToken();
		alert("access token: " + superToken);
	}
	
	
	
	main();
	
}
)();