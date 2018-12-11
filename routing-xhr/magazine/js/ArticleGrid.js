const ArticleGrid = props => {
  return (
    <div className="row m-3">
      {props.items.map(item => (
        <div className="col-sm" key={item.guid}>
          <ArticleGridItem {...item.value} hideTitle={props.hideTitle} />
        </div>
      ))}
    </div>
  );
};
