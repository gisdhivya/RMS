import { Component, OnInit,TemplateRef} from '@angular/core';
import {HeaderService} from '../services/header.service';
import {HttpService} from '../services/http.service';
import {ForumVar} from '../Constants/forum.var';
import { ToastrService } from 'ngx-toastr';
import { BsModalService } from 'ngx-bootstrap/modal';
import { API_URL } from '../Constants/api_url';
import { AlertService } from '../services/alert.service';

@Component({
    selector: 'app-forum',
    templateUrl: './forum.component.html',
    styleUrls: ['./forum.component.css']
})

export class ForumComponent implements OnInit {
   
   
    successMessage = '';
    errorMessage = '';
    constructor(private toastr:ToastrService,private modalService:BsModalService,private headerService:HeaderService,private forumVar:ForumVar,private http: HttpService,private alertService:AlertService){
       this.forumVar.url = API_URL.URLS;
    }

   ngOnInit(){
    this.headerService.setTitle({title:this.forumVar.title, hidemodule:false});
    this.getForumList();
   // this.getEmployeeList();
    this.getDepartmentList();
   }

    getForumList(){
          this.http.get(this.forumVar.url.getForumList).subscribe((data) => {
          this.forumVar.forumList= data.forumDetails;
        });
    }
    getEmployeeList(){
        this.http.get(this.forumVar.url.getEmployeeList).subscribe((resp) => {
           this.forumVar.autocompleteItemsAsEmpObjects = resp.employeeList.map(item=>{
             return item.name;
           });
         });
    }
    getDepartmentList(){
        this.http.get(this.forumVar.url.getDepartments).subscribe((resp) => {
            this.forumVar.autocompleteItemsAsEmpObjects = resp.DepartmentList.map(item=>{
              return item.department;
            });
          });
    }
    statusUpdate(forumName,status){
        let statusName = status ? " is Activated" : " is Deativated"
       // this.toastr.success(forumName + statusName);
        this.alertService.success(forumName + statusName);
      }

    openEditModal(template: TemplateRef<any>, forum) {
        this.forumVar.modalRef = this.modalService.show(template,this.forumVar.modalConfig);
        this.forumVar.forumName= forum.forumName;
        this.forumVar.topics=forum.topic;
        this.forumVar.employeeItems=forum.departments;
    }

    onSave(form){
      if(form.valid){
       // this.toastr.success(form.value.forumName + this.forumVar.updateSuccessMsg);
        this.alertService.success(form.value.forumName + this.forumVar.updateSuccessMsg);
        this.forumVar.modalRef.hide();
     }
    }


}
