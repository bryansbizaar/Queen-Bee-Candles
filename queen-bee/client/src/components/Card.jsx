import PropTypes from "prop-types";
import formatAmount from "../utils/formatAmount";

const Card = ({ title, price, description, image }) => {
  // Handle both full URLs and image filenames
  const imageUrl = image?.includes("http")
    ? image
    : `http://localhost:8080/images/${image}`;

  return (
    <div className="card">
      {image && <img className="card-img" src={imageUrl} alt={title} />}
      <h2 className="card-title">{title}</h2>
      <h3 className="card-price">{formatAmount(price)}</h3>
      <p className="card-text">{description}</p>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
};

export default Card;
