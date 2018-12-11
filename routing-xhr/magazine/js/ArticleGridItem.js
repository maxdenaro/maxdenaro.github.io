const ArticleGridItem = props => (
  <div className="card">
    <img
      className="card-img-top"
      src={
        props.imgSrc || `https://picsum.photos/260/180/?image=${random(1, 50)}`
      }
      alt={props.title}
    />
    <div className="card-body">
      {props.hideTitle ? null : (
        <h5 className="card-title">{props.title}</h5>
      )}
      <p className="card-text">{props.gridDescription || props.description}</p>
      <NavLink
        exact={true}
        className="btn btn-primary"
        to={props.href || `/article/${props.id}`}
      >
        {props.buttonText || "Подробнее"}
      </NavLink>
    </div>
  </div>
);
