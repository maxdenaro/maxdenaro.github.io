const withFetcher = ({ url, collName }) => WrappedComponent => 
  class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        [collName]: []
      };
    }

    componentDidMount() {
      if (typeof url === "function") {
        url = url(this.props);
      }

      const params = {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      };

      fetch(url, params)
        .then(response => response.json())
        .then(data => {
          this.setState({ [collName]: data });
        });
    }

    render() {
      // Честно говоря, тут не до конца понял момент с развёртыванием state (а именно {...this.state}). 
      // Получается, мы передаём не state, а сами переменные state, которые мы потом должны руками в state соответствующего компонента занести? 
      // В качестве примера см. componentWillReceiveProps компонента App.
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  };

const AppFetcher = withFetcher({
  url: "https://baconipsum.com/api/?type=meat-and-filler&paras=50",
  collName: "logs"
})(App);
