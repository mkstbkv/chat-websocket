import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { Store } from '@ngrx/store';
import { AppState } from '../../store/types';
import { NgForm } from '@angular/forms';

interface Message {
  user: User,
  text: string
}

interface ServerMessage {
  type: string,
  messages: {
    messages: Message[],
    users: User[],
    user: User
  }
}

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.sass']
})
export class ChatsComponent implements OnInit, OnDestroy {
  @ViewChild('f') form!: NgForm;
  users: User[] = [];
  messages: Message[] = [];
  ws!: WebSocket;

  user: Observable<null | User>;
  userSub!: Subscription;
  token!: string;
  userOne!: User;

  constructor(
    private store: Store<AppState>,
  ) {
    this.user = store.select(state => state.users.user);
  }

  ngOnInit() {
    this.userSub = this.user.subscribe(user => {
      if (user) {
        this.userOne = user;
        this.token = user.token
      }
    });

    this.ws = new WebSocket('ws://localhost:8000/chat');
    this.ws.onclose = () => {
      console.log("ws closed");
    };

    this.ws.onmessage = event => {
      const decodedMessage: ServerMessage = JSON.parse(event.data);
      this.users.push(decodedMessage.messages.user)

      if (decodedMessage.type === 'NEW_MESSAGE') {
        this.messages = decodedMessage.messages.messages;
      }

      if (decodedMessage.type === 'PREV_MESSAGES') {
        this.messages = decodedMessage.messages.messages;
        this.users = decodedMessage.messages.users;
      }

      if (decodedMessage.type === 'LOGOUT') {
        this.users = decodedMessage.messages.users;
      }
    };

    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({type: 'LOGIN', token: this.token}))
    }

    this.ws.close = () => {
      this.ws.send(JSON.stringify({type: 'USER_LOGOUT', token: this.token}))
    }
  }

  sendMessage() {
    this.ws.send(JSON.stringify({
      type: 'SEND_MESSAGE',
      user: this.userOne,
      text: this.form.form.value.text
    }));
  }

  ngOnDestroy() {
    this.ws.close();
    this.userSub.unsubscribe();
  }
}
