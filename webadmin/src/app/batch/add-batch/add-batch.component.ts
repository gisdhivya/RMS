import { Component, OnInit ,Output, Input, EventEmitter} from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BatchVar } from '../../Constants/batch.var';
import { API_URL } from '../../Constants/api_url';
import { ActivatedRoute, Params } from '@angular/router';
import { DatePipe } from '@angular/common';
import {CommonService,AlertService,HttpService,UtilService,HeaderService,UserService, ResortService} from '../../services';
import * as moment from 'moment';

@Component({
    selector: 'app-add-batch',
    templateUrl: './add-batch.component.html',
    styleUrls: ['./add-batch.component.css']
})

export class AddBatchComponent implements OnInit {
    @Output() someEvent = new EventEmitter<string>();
    @Input() courseList: any = [];
    courseIds=[];
    durationValue = '1';
    maxdurationCount;
    countCheck = false;
    countError;
    reminder;
    status;
    showToDate = false;
    showFromDate = false;
    dateError = false;
    submitted = false;

    constructor(private alertService: AlertService,private utilService:UtilService,private resortService:ResortService,private userService: UserService,private headerService: HeaderService, private datePipe: DatePipe, private activatedRoute: ActivatedRoute, private http: HttpService, public batchVar: BatchVar, private toastr: ToastrService, private router: Router, private commonService:CommonService) {
        this.batchVar.url = API_URL.URLS;
        this.activatedRoute.params.subscribe((params: Params) => {
            this.batchVar.batchId = params['batchId'];
        });

    }


    ngOnInit() {
      this.batchVar.batchId ? this.headerService.setTitle({ title: this.batchVar.editTitle, hidemodule: false }) : '';
        this.batchVar.moduleForm=[];
        this.courseForm();

        //get Resort list
        const resortId = this.utilService.getUserData().Resorts[0].resortId; 
        this.resortService.getResortByParentId(resortId).subscribe((result)=>{
            this.batchVar.resortList=result.data.Resort;
            this.batchVar.divisionList=result.data.divisions;

        })

        //get percentage list
        this.http.get(this.batchVar.url.getPercentageList).subscribe((data) => {
            this.batchVar.percentageList = data.passPercentage;
        });

        let startDate = localStorage.getItem('BatchStartDate');
        //   let startDate = new Date(); 
        //   this.batchVar.batchFrom= this.splitDate(startDate).toISOString();
        //   this.batchVar.min =this.splitDate(new Date());
        this.batchVar.batchFrom = new Date(startDate);
        this.getBatchDetail();
    }

    selectFilter(data) {
        let startDate = localStorage.getItem('BatchStartDate');
        return data.value >= new Date(startDate);
    }

    courseForm(){
      this.courseIds = this.courseList.map(a => a.courseId);
      this.courseList.forEach((item,key) => {
        let obj = { 'courseId': item.courseId,
                 'courseName': item.courseName,
                 'passpercentage':"null",
                 'mandatory' :"true"}
         this.batchVar.moduleForm.push(obj);
     });
    }

    errorCheck() {
        let now = moment(this.batchVar.batchFrom);
        let end = moment(this.batchVar.batchTo);
        let duration = moment.duration(end.diff(now));
        var days = duration.asDays();
        if (days < 0) {
            this.dateError = true;
        }
        else {
            this.dateError = false;
        }
    }

    durationUpdate() {
        if (this.durationValue === '1') {
            this.maxdurationCount = 60;
        }
        else if (this.durationValue === '2') {
            this.maxdurationCount = 24;
        }
        else {
            this.maxdurationCount = 500;
        }
        this.countErrorCheck();
    }

    countErrorCheck() {
        if (this.durationValue === '1' && this.reminder > 60) {
            this.countCheck = true;
            this.countError = this.batchVar.mandatoryLabels.minCountError;
        }
        else if (this.durationValue === '2' && this.reminder > 24) {
            this.countCheck = true;
            this.countError = this.batchVar.mandatoryLabels.hourCountError;
        }
        else {
            this.countCheck = false;
            this.countError = "";
        }
    }

    //get edit batch details
    getBatchDetail() {
        this.http.get(this.batchVar.url.getNewBatchList).subscribe((data) => {
            this.batchVar.batchList = data.batchDetails;
            if (this.batchVar.batchId) {
                let batchObj = this.batchVar.batchList.find(x => x.batchId === parseInt(this.batchVar.batchId));
                this.batchVar.selectedEmp = batchObj.employeeIds;
                this.batchVar.batchFrom = new Date(batchObj.fromDate);
                this.batchVar.batchTo = new Date(batchObj.toDate);
                this.batchVar.batchName = batchObj.batchName;
                this.batchVar.moduleForm = batchObj.moduleDetails;
                this.durationValue = batchObj.notification.durationType;
                this.reminder = batchObj.notification.durationValue;
            }
        });
    }
    

    onEmpSelect(event,key) {
        this.batchVar.employeeId = this.batchVar.selectedEmp.map(item => { return item.employeeId });
        this.batchVar.departmentId = this.batchVar.selectedDepartment.map(item => { return item.departmentId });
        this.batchVar.divisionId = this.batchVar.selectedDivision.map(item => { return item.divisionId });

        if(key == 'div'){
            const obj={'divisionId': this.batchVar.divisionId};
            this.commonService.getDepartmentList(obj).subscribe((result)=>{
            if(result.isSuccess){
                this.batchVar.departmentList = result.data.rows;
                }
            })
        }
       
        if(key == 'dept'){
        const data={'divisionId': this.batchVar.divisionId, 'departmentId':  this.batchVar.departmentId, 'createdBy':this.utilService.getUserData().userId}
         this.userService.getUserByDivDept(data).subscribe(result=>{
             this.batchVar.employeeList = result.data;
         })
        }

        if(key == 'emp'){
            console.log(event,"EVENT");
        }

        this.batchVar.empValidate = false;
    }

    
    splitDate(date) {
        const newDate = new Date(date);
        const y = newDate.getFullYear();
        const d = newDate.getDate();
        const month = newDate.getMonth();
        const h = newDate.getHours();
        const m = newDate.getMinutes();
        return new Date(y, month, d, h, m);
    }

    fromDateChange(date) {
        //  let fromDate=date.toISOString();
        this.batchVar.batchFrom = date;
    }
    dateInputClick() {
        this.showToDate = !this.showToDate;
    }
    fromDateInputClick() {
        this.showFromDate = !this.showFromDate;
    }

    toDateChange(date) {
        this.batchVar.batchTo = date;
    }

    autoHide(data) {
        let value = data[1];
        if (value === 'dl-abdtp-date-button') {
            this.showToDate = false;
            this.showFromDate = false;
        }
    }


    //submit batch
    addBatch(form) {
        this.submitted = true;
        this.batchVar.empValidate = this.batchVar.employeeId ? false : true;
        this.batchVar.dategreater = Date.parse(this.batchVar.batchFrom) >= Date.parse(this.batchVar.batchTo) ? true : false;
        //this.status = ( Date.parse(this.batchVar.batchFrom) == Date.parse(new Date()) ) ? 'assigned' : 'unassigned';
        let toastrMsg = this.batchVar.batchId ? this.batchVar.batchErrMsg : this.batchVar.batchSuccessMsg;
        if (this.batchVar.batchFrom && this.batchVar.batchTo && this.batchVar.batchName && this.batchVar.employeeId && this.batchVar.moduleForm && this.durationValue && this.reminder) {
            let postData = {
                assignedDate: this.datePipe.transform(this.batchVar.batchFrom, 'yyyy-mm-dd hh:mm'),
                dueDate: this.datePipe.transform(this.batchVar.batchTo, 'yyyy-mm-dd hh:mm'),
                name: this.batchVar.batchName,
                status: 'assigned',
                notificationDays: this.reminder,
                resort:{
                    "resortId": this.batchVar.selectedResort,
                    "courses":  this.courseIds,
                    "users": this.batchVar.selectedEmp
                 },
                courses: this.batchVar.moduleForm,
            }
            this.alertService.success(toastrMsg);
            this.hidePopup();
        }
    }

    hidePopup(){
        this.clearBatchForm();
        this.someEvent.next();
    }

    clearBatchForm() {
        // this.batchVar.moduleForm = [{
        //     moduleId: 1,
        //     program: "null",
        //     passpercentage: "null",
        //     mandatory: "true",
        // }];
        // this.batchVar.batchFrom = '';
        // this.batchVar.batchTo = '';
        // this.batchVar.selectedEmp = [];
        // this.batchVar.batchName = '';
        // this.router.navigateByUrl('/calendar');
    }

  

    //dynamic remove module fields
    removeForm(i) {
        this.batchVar.moduleForm.splice(i, 1);
    }



}
