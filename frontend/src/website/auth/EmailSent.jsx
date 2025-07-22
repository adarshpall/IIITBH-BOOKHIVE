import React from "react";
import { AiOutlineMail } from "react-icons/ai";

const EmailSent = () => {
  return (
    <div className="bg text__color auth__card__wrapper">
      <div className="auth__card__container">
        <div className="heading">
          <h1>CONFIRM ACCOUNT</h1>
          <div className="bg__primary email__icon__box">
            <AiOutlineMail/>
          </div>
          <h5 style={{textAlign:"center",margin:"10px 0"}}>Check your mail</h5>
          <p>We have sent a password recovery link to your mail</p>
          <div style={{textAlign:"center",margin:"20px 0"}}>
            <a
              href="https://mail.google.com/mail/u/0/#inbox"
              className="btn btn__primary"
            >
              VISIT MAIL
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailSent;
