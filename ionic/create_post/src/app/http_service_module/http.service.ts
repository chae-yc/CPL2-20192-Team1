import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from  '@angular/common/http';
import { tap } from  'rxjs/operators';
import { Observable, BehaviorSubject } from  'rxjs';
import { StorageService } from '../storage_service_module/storage.service'
import { async } from '@angular/core/testing';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private httpClient : HttpClient,
    private storage: StorageService
  ) { }

  SERVER_ADDRESS: string = "http://54.180.89.77:9000";
  header = new HttpHeaders(
    {'Content-Type': 'application/json',
    'Accept': 'application/json',
    }
  );

  httpSubject  =  new  BehaviorSubject(false);

  register(info) {
    let URL = `${this.SERVER_ADDRESS}/user/register`;
    this.httpClient.post(URL, info, {headers: this.header})
    .subscribe(
       tap( async res => {
        console.log("REGISTER "+ res["register"])
        if(res["register"] === "success"){
          this.httpSubject.next(true);
        }else{
          this.httpSubject.next(false);
        }
      }),
      async error =>{
        console.log(error.status);
        console.log(error.error);
        console.log(error.headers);
        this.httpSubject.next(false);
      }
    );
    return this.httpSubject.asObservable();
  }

  login(info) {
    let URL = `${this.SERVER_ADDRESS}/user/login`;
    this.httpClient.post(URL, info, {headers: this.header})
    .subscribe(
      tap( async res => {
        console.log("Login "+ res["login"])
        if(res["login"] === "success"){
          await this.storage.save_id(info["email"]);
          this.httpSubject.next(true);
        }else{
          this.httpSubject.next(false);
        }
      }),
      async error =>{
        console.log(error.status);
        console.log(error.error);
        console.log(error.headers);
        this.httpSubject.next(false);
      }
    );
    return this.httpSubject.asObservable();
  }

  // save_id
  // save_role
  // logout
  // out_role
  
  // logout(){
  //   this.storage.del_id();
  // }

  // isLogin(){
  //   return this.storage.get_uid() != null ? true : false;
  // }
  
}