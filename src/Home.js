import React from 'react'
import { v4 as uuidv4 } from 'uuid';
import './styles/Home.css'

let link;
let uuid;
function button_click(){
  if(document.getElementById("name_input").value === ""){alert("It can't be empty")}
  else{
      uuid = uuidv4()
      document.getElementById("link_").href = window.location.href+`game?name=${document.getElementById("name_input").value}&id=${uuid}`
      document.getElementById("link_text").textContent = window.location.href+`game?name=${document.getElementById("name_input").value}&id=${uuid}`
      document.getElementById("link_div").style.opacity = 1
      link = window.location.href+`game?name=${document.getElementById("name_input").value}&id=${uuid}`
    }
}
export default function Home() {
  return (
    <div>
        <div id="home_background">
            <div className="text-white" id="enter_name_text">Please enter your name :</div>
            <input type="text" className="form-control" id="name_input" />
            <button id="submit_button" onClick={button_click}>Enter</button>
        </div>
        <div className="link_div" id="link_div">
          <a href='/' id="link_">
            <div className='link_text' id='link_text' href='/game'></div>
          </a>
          <img
            onClick={()=>{
              navigator.clipboard.writeText(link);
              alert("Link copied to clipboard!");
            }}
            className='copy_image'
            alt="loading..."
            src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyfTs-2UL-mX0PwViI-FD2j7CjnlMAZ6U3pg&usqp=CAU'
            title="Click to copy"
          />
        </div>
    </div>
  )
}
