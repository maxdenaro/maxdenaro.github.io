"use strict";

class Article extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      article: null
    };
  }

  componentWillMount() {
    const article = getItemById(this.props.items, this.props.match.params.id);
    this.setState({ article: article });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ article: nextProps.article });
  }

  render() {
    const { article } = this.state;
    return (
      article && (
        <div>
          <article className="container m-5">
            <h1>{article.value.title}</h1>
            {article.value.additionalDescription && (
              <p>{article.value.additionalDescription}</p>
            )}
            {article.value.additionalTitle && (
              <h2>{article.value.additionalTitle}</h2>
            )}
            {getItemsWithIds(article.value.body.split("\n")).map(text => (
              <p key={text.guid}>{text.value}</p>
            ))}
          </article>
        </div>
      )
    );
  }
}
