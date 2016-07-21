<?php
namespace GIS;

require_once( dirname(__FILE__) . '/AuthProvider.php' );

/**
 * Class AuthProviderUser
 *
 * @author Karl Johann Schubert <karljohann.schubert@aiesec.de>
 * @version 0.1
 * @package GIS
 */
class AuthProviderUser implements AuthProvider {

    /**
     * @var String
     */
    private $_username;

    /**
     * @var String
     */
    private $_password;

    /**
     * @var String
     */
    private $_token;

    /**
     * @param String $user username of the user
     * @param String $pass password of the user
     */
    function __construct($user, $pass) {
        $this->_username = $user;
        $this->_password = $pass;
    }

    /**
     * @return String
     * @covers \GIS\AuthProviderUser::generateNewToken
     */
    public function getToken() {
        return $this->_token;
    }

    /**
     * @return String
     * @throws InvalidAuthResponseException
     * @throws InvalidCredentialsException
     * @covers \GIS\AuthProviderUser::generateNewToken
     */
    public function getNewToken() {
        $this->_token = $this->generateNewToken();

        return $this->_token;
    }

    /**
     * generateNewToken()
     *
     * function that performs a login with GIS auth to get a new access token
     *
     * @return String access token
     * @throws \GIS\InvalidCredentialsException if the username or password is invalid
     * @throws \GIS\InvalidAuthResponseException if the response does not contain the access token
     */
    private function generateNewToken() {
        $data = "user%5Bemail%5D=" . urlencode($this->_username) . "&user%5Bpassword%5D=" . urlencode($this->_password);

        $req = curl_init('https://auth.aiesec.org/users/sign_in');
        curl_setopt($req, CURLOPT_POST, true);
        curl_setopt($req, CURLOPT_POSTFIELDS, $data);
        curl_setopt($req, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($req, CURLOPT_HEADER, 1);
        curl_setopt($req, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($req, CURLOPT_COOKIEFILE, "");
        $res = curl_exec($req);
        curl_close($req);

        // get token cookie;
        $token = false;
        preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $res, $cookies);
        foreach($cookies[1] as $c) {
            parse_str($c, $cookie);
            if(isset($cookie["expa_token"])) $token = trim($cookie["expa_token"]);
        }
		//$token = "7302018ee0ddc967dee285b3c3e97dd9ba8e068853a865646529fab652cce6ec";
        if($token !== false && $token !== null) {
        	$_SESSION['token'] = $token;
            return $token;
        } else  {
        	//return $token;
            if(strpos($res, "<h2>Invalid email or password.</h2>") !== false) {
                throw new InvalidCredentialsException("Invalid email or password");
            } else {
                throw new InvalidAuthResponseException("The GIS auth response does not match the requirements.");
            }
        }
    }
}