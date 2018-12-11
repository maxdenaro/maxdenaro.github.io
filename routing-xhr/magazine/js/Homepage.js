"use strict";

const Homepage = props => {
  const subscriptions = getItemsWithIds(props.subscriptions);
  const articles = getItemsWithIds(props.articles);
  return (
    <div>
      <div className="container">
        <Switch>
          <Route exact path="/">
            <div>
              <ArticleGrid items={subscriptions} hideTitle />
              <ArticleGrid items={articles}/>
            </div>
          </Route>
          <Route
            exact
            path="/article/:id"
            render={props => <Article {...props} items={articles} />}
          />
          <Route
            exact
            path="/subscription"
            render={props => <ArticleWithConfirm {...props} items={subscriptions} />}
          />
        </Switch>
      </div>
    </div>
  );
};
