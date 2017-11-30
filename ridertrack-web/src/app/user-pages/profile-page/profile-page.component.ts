import { Component, Input, OnInit, Injectable, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { UserService } from '../../shared/services/user.service';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {

  private user: User = new User();
  editForm: FormGroup;
  name: String;
  surname: String;
  email: String;

  private urlImage: any;
  private urlNoImage = '../../../assets/img/user_fake_img.png';

  constructor(private formBuilderLogin: FormBuilder, private userService: UserService) { }

  ngOnInit() {
    this.userService.getUser().subscribe(
      (user: User) =>{
        this.user = user;
      }
    );
   }


  edit(){
    console.log("[User locally updated]",this.user);
  }

  urlChanged(event: any) {
    if(event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.onload = (event: any) => {
        this.urlImage = event.target.result;
      },
        reader.readAsDataURL(event.target.files[0]);
    }
  }

}