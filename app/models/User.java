package models;


import javax.persistence.*;
import org.mindrot.jbcrypt.BCrypt;
import play.db.ebean.*;



@Entity
public class User extends Model {

	
	@Id
    public Long id;
    public String email;
    public String name;
    public String password;
    
    
    public User(String email, String name, String password) {
      this.email = email;
      this.name = name;
      this.password = password;
    }
    
    /*
    public static Finder<String,User> find = new Finder<String,User>(
        String.class, User.class
    );*/


}