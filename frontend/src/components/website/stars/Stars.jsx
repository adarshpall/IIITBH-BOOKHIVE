import {FaStarHalfAlt,FaStar,FaRegStar} from 'react-icons/fa';

function Stars({rating}) {
    const stars = Array.from(({length:5}),(_,i)=>{
        let number = i + 0.5;
        return rating >= i+1 ? <FaStar className='star' key={i} />: rating >= number ? <FaStarHalfAlt className='star' key={i} />  : <FaRegStar className='star' key={i} />
    });
    
  return (
    <div style={{margin:"10px 0"}}>
        {stars}
    </div>
  )
}

export default Stars