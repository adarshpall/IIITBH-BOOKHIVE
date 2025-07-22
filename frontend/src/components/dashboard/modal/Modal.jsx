import "./modal.scss";

function Modal({title,show,onClose,isLarge,children}) {
   
  return (
    <div className={`modal__wrapper bg__secondary ${show && "show__modal"}`}>
        <div className={`modal__container modal__container__active bg__accent text__color ${isLarge && "modal__lg"} `}>
            <button className="btn__x text__color" onClick={onClose}>&times;</button>
            <h3>{title}</h3>
            {children}
        </div>
    </div>
  )
}

export default Modal