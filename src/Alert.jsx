import React, { useEffect } from 'react';
import './styles/Alert.css'

const Alert = ({ message, draw, func=Function}) => {
  useEffect(() => {
    if (!draw) {
      document.getElementById("alert").style.justifyContent = 'center';
    }
  }, [draw]);

  return(
    <div id="alert" className="alert">
      <span className="message">{message}</span>
      {draw && <div className="accept_deny">
        <button className='accept' onClick={func} id='accept_draw'>Accept <span>&#10004;</span></button>
        <button className='deny' onClick={()=>{document.getElementById("alert").style.opacity = 0; document.getElementById("alert").style.height = 0;document.getElementById("alert").style.width = 0}}>Deny <span>&#10006;</span></button>
      </div>}
    </div>
  ) ;
};

export default Alert;
