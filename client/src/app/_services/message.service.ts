import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { getPaginatedResult, getPaginationHeaders } from './paginationHelper';
import { Message } from '../_models/message';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_models/user';
import { BehaviorSubject, take } from 'rxjs';
import { Group } from '../_models/groups';
import { BusyService } from './busy.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl = environment.apiUrl;
  hubUrl = environment.hubUrl;
  private hubConnection?: HubConnection;
  private messageThreadSource = new BehaviorSubject<Message[]>([]);
  messageThread$ = this.messageThreadSource.asObservable();

  constructor(private http: HttpClient, private busyService: BusyService) { }

  createHubConnection(user: User, otherUsername: string)  //Signal r
  {
    this.busyService.busy();      //loading spinner signalR
    this.hubConnection = new HubConnectionBuilder()   // name 'message' provided in program.cs
      .withUrl(this.hubUrl + 'message?user=' + otherUsername, {
        accessTokenFactory: ()  => user.token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .catch(error => console.log(error))
      .finally(() => this.busyService.idle()) //gives loading spinner when signalR connects for messages

    this.hubConnection.on('ReceiveMessageThread', messages => {
      this.messageThreadSource.next(messages);
    })

    this.hubConnection.on('UpdatedGroup', (group: Group) => {
      if (group.connections.some(x => x.username === otherUsername)) {
        this.messageThread$.pipe(take(1)).subscribe({
          next: messages => {
            messages.forEach(message => {
              if (!message.dateRead) {    // ie message is not read
                message.dateRead = new Date(Date.now())   //ie mark read
              }
            })
            this.messageThreadSource.next([...messages]);
          }
        })
      }
    })

    this.hubConnection.on("NewMessage", message => {
      this.messageThread$.pipe(take(1)).subscribe({
        next: messages => {
          this.messageThreadSource.next([...messages, message])  //Spread operator creates new array and adds, doesnt mutate
        }
      })
    })
  }

  stopHubConnection() {
    if (this.hubConnection){      // Prevent crash if destroy hub connection on changing component if hub not active
      this.messageThreadSource.next([]);    // clear messages when user leaves component or moves to other message thread(services persist, unlike components)
      this.hubConnection.stop();
    }
  }

  getMessages(pageNumber: number, pageSize: number, container: string)
    {
      let params = getPaginationHeaders(pageNumber, pageSize);
      params = params.append('Container', container);
      return getPaginatedResult<Message[]>(this.baseUrl + 'messages', params, this.http);
    }

  getMessagesThread(username: string) {
    return this.http.get<Message[]>(this.baseUrl + 'messages/thread/' + username);
  }

  async sendMessage(username: string, content: string) {    //async keyword ensure JS promise is returned even though invoke should do this
    return this.hubConnection?.invoke('SendMessage', {recipientUsername: username, content}) //SendMessage from MessageHub.cs
    .catch(error => console.log(error))
  }

  deleteMessage(id: number){
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}
