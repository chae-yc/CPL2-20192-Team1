import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private user = {
    email: '',
    password: ''
  }

  constructor(private http: HttpClient, private navCtrl: NavController) { }

  login(form){
    let headers = new HttpHeaders();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type', 'application-json');

    const URL = "http://54.180.89.77:9000/user/login";
    this.http.post(URL, form.value, {headers: headers})
    .subscribe(data=>{
      console.log(data['check']);
    }, error=>{
      console.log(error.status);
      console.log(error.error);
      console.log(error.headers);
    })
  }

  goSignUp() {
    this.navCtrl.navigateForward('/signup');
  }

}
