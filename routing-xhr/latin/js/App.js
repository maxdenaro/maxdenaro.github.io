class App extends React.Component {
  render() {
    return (
      <div>
        <Header />
        <Switch>
          <Route exact path="/">
            <Homepage />
          </Route>
          <Route path="/article/:id" component={Story} />
        </Switch>
      </div>
    );
  }
}
