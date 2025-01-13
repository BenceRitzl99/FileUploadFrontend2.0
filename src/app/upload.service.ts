import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UploadService {
  path="/uploads"
  
  api="http://localhost:3000/"

  constructor(private db:AngularFireDatabase, private storage:AngularFireStorage, private http:HttpClient) { }

  uploadFileExpress(file:any){
    const formData = new FormData()
    formData.append('file', file)

    return this.http.post(this.api+"upload", formData,)
  }

  saveFileData(url:any, filename:any){
    this.db.list(this.path).push({url:url, filename:filename})
  }

  getFiles(){
    return this.db.list(this.path)
  }

  getFilesExpress(){
    return this.http.get(this.api+"files")
  }

  uploadFile(file:any){
    const filename = Date.now() +"-"+String(Math.round(Math.random()*89999+10000)) +": "+ file.name
    const filePath = this.path+"/"+filename
    console.log(filename)
    const uploadTask = this.storage.upload(filePath,file)
    const storageRef = this.storage.ref(filePath)



    uploadTask.snapshotChanges().pipe(
      finalize(()=>{
        storageRef.getDownloadURL().subscribe((url)=>
          this.saveFileData(url, filename))
        
        

      })
    ).subscribe()
  

    return uploadTask.percentageChanges()
  }

  deleteFile(file:any){
    console.log(file)
    this.storage.ref(this.path).child(file.filename).delete().subscribe(
      () => this.db.list(this.path).remove(file.key).then(
        () => console.log("deleted")
      )
      .catch(
        (err)=>console.log(err)
      )
    )
  }


  deleteFileExpress(fileName:any){
    return this.http.delete(this.api+"files/"+fileName)
  }
}
