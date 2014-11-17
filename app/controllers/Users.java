package controllers;

import java.util.List;
import org.mindrot.jbcrypt.BCrypt;
import com.avaje.ebean.Ebean;
import com.fasterxml.jackson.databind.JsonNode;
import play.libs.Json;
import play.mvc.*;
import models.User;


public class Users extends Controller {
	
	static JsonNode result;
	
	// SHOW ALL USERS
    public static Result displayAllUsers() {
    	
    	List<User> users = Ebean.find(User.class).findList();

    	if (users.isEmpty()) {
    		result = Json.parse("{\"status\": 0, \"msg\": \"No users found\"}");
    	} else {
    		result = Json.toJson(users);
    	}
    	
    	return ok(result);
    	
    }
    

    // ADD USER
    public static Result addUser() {

    	JsonNode data = request().body().asJson();
    	Boolean canAdd = true;
    	String msg = "User added";
    	Integer status = 1;
    	
    	
    	// extract the data from the json to validate/secure/whatever - do not add as-is to db.
    	String name = data.findPath("name").textValue();
    	String email = data.findPath("email").textValue();
    	String password = BCrypt.hashpw(data.findPath("password").textValue(), BCrypt.gensalt());
    	
    	// check empty fields
    	if (name.isEmpty() || password.isEmpty() || email.isEmpty()) {
    		msg = "Missing Data";
    		canAdd = false;
    		status = 0;
    	}
    	
    	// check if user exist
    	User checkUser = Ebean.find(User.class).select("email").where().eq("email", email).findUnique();
    	
    	if (checkUser != null) {
    		msg = "User already exist";
    		canAdd = false;
    		status = 0;
    	}
    	
    	// if all ok then save
    	if (canAdd) {
    		User user = new User(email,name,password);
    		user.save();
    		
    		// return the new user data back to Front end (with the newly assigned ID) and any other server-side additions if we like
    		// We can pass back only the ID and use the form data, it will be better traffic-wise but uglier solution IMO
    		
    		User insertedUser = Ebean.find(User.class).select("id,name,email,password").where().eq("email", email).findUnique();

    		result = Json.parse(
	    				"{\"status\":" +status + ","
	    				+ "\"msg\": \"" + msg + "\","
	    				+ "\"id\": " + insertedUser.id + ","
	    				+ "\"name\": \"" + insertedUser.name + "\","
	    				+ "\"email\": \"" + insertedUser.email + "\","
	    				+ "\"password\": \"" + insertedUser.password + "\"}"
    				);
    		
    	} else {
    		result = Json.parse("{\"status\":" +status +", \"msg\": \"" + msg + "\"}");
    	}
    	
    	return ok(result);
    	
    }
    
    
    // UPDATE USER
    public static Result changeUser(Long id) {
    	
    	JsonNode data = request().body().asJson();
    	String msg = "User modified";
    	Integer status = 1;
    	Boolean canAdd = true;
    	
    	// extract the data from the json to validate/secure/whatever - do not add as-is to db.
    	String name = data.findPath("name").textValue();
    	String email = data.findPath("email").textValue();
    	String password = BCrypt.hashpw(data.findPath("password").textValue(), BCrypt.gensalt());
    	
    	// check empty fields
    	if (name.isEmpty() || password.isEmpty() || email.isEmpty()) {
    		msg = "Missing Data";
    		status = 0;
    		canAdd = false;
    	}
    	
    	// find the actual user by id
    	User user = Ebean.find(User.class, id); 
    	
    	if (user == null) {
    		status = 0;
    		canAdd = false;
    		msg = "No such user";
    	}
    	
    	// if he's trying to update mail - validate the mail VS the id to avoid mail duplicates
    	User checkUser = Ebean.find(User.class).select("email,id").where().eq("email", email).findUnique();
    	
    	if (checkUser != null && checkUser.id != user.id) {
    		msg = "Such email already exist";
    		status = 0;
    		canAdd = false;
    	}
    	
    	if (canAdd) {
    		user.name = name;
    		user.email = email;
    		user.password = password;
    		user.save();
    	}
    	
    	result = Json.parse("{\"status\":" +status +", \"msg\": \"" + msg + "\"}");

    	return ok(result);
    	
    }
    
    
    // DELETE USER
    public static Result deleteUser(Long id) { 
    	
    	// don't load all the user properteis for a simple delete. just find unique by id
    	// We can go Ebean.find(user.class, Id) , but this is a more compact solution
    	
    	User user = Ebean.find(User.class).select("id").where().eq("id", id).findUnique();
    	
    	if (user != null) {
    		result = Json.parse("{\"status\": 1, \"msg\": \"User removed\"}");
    		user.delete();
    	} else {
    		result = Json.parse("{\"status\": 0, \"msg\": \"User not found\"}");
    	}

    	return ok(result);
    }
    

}
