import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TimeagoModule } from 'ngx-timeago';
import { Message } from 'src/app/_models/message';
import { MessageService } from 'src/app/_services/message.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,  //Scrolling causes angular to log error in browser console
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  standalone: true,
  styleUrls: ['./member-messages.component.css'],
  imports: [CommonModule, TimeagoModule, FormsModule]
})
export class MemberMessagesComponent implements OnInit {
  @ViewChild('messageForm') messageForm?: NgForm;
  @Input() username?: string;
  messageContent = '';
  loading = false;


  constructor (public messageService: MessageService) {}

  ngOnInit(): void {

  }

  sendMessage() {
    if (!this.username) return;     //then used with promises, subscribe used with observables
    this.loading = true;
    this.messageService.sendMessage(this.username, this.messageContent).then(() => {  //empty callback function, not doing anything with messages we get back, as messageThread$ is handling
      this.messageForm?.reset();
    }).finally(() => this.loading = false);   //remove loading flag after msg sent
  }

}
