import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection; // Dont have this at the time service is constructed - signalR
  private onlineUsersSource = new BehaviorSubject<string[]>([]);    // Initally empty array
  onlineUsers$ = this.onlineUsersSource.asObservable();

  constructor(private toastr: ToastrService, private router: Router) { }

  createHubConnection(user: User) {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl + 'presence', {
        accessTokenFactory: () => user.token
      })
      .withAutomaticReconnect()         // Attempts to reconnect
      .build();

    this.hubConnection.start().catch(error => console.log(error)); // Returns promise, log error

    this.hubConnection.on('UserIsOnline', username => {
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: usernames => this.onlineUsersSource.next([...usernames, username])
      })
    })

    this.hubConnection.on('UserIsOffline', username => {    //Matches endpoint in PresenceHub.cs
      this.onlineUsers$.pipe(take(1)).subscribe({
        next: usernames => this.onlineUsersSource.next(usernames.filter(x => x !== username)) //similar to spread operator, filter creates new array, but removes one user
      })
    })

    this.hubConnection.on('GetOnlineUsers', usernames => {
      this.onlineUsersSource.next(usernames);     //next emits usernames to those subscribed 
    })

    this.hubConnection.on("NewMessageReceived", ({username, knownAs}) => {
      this.toastr.info(knownAs + ' has sent you a new message! Click me to see it')
      .onTap
      .pipe(take(1))
      .subscribe({          //nav to messages tab from notification toast
        next: () => this.router.navigateByUrl('/members/' + username + '?tab=Messages')
      })
    })
  }

  stopHubConnection() {
    this.hubConnection?.stop().catch(error => console.log(error)) // if problems disconnecting, logged
  }
}
