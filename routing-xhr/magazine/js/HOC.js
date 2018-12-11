"use strict";

const withNav = WrappedComponent => {
  let WithNav = null;
  if (isStateless(WrappedComponent)) {
    WithNav = function(...args) {
      const f = (
        <div>
          <Nav />
          {WrappedComponent(...args)}
        </div>
      );
      return f;
    };
  } else {
    WithNav = class extends React.Component {
      render() {
        return (
          <div>
            <Nav />
            <WrappedComponent {...this.props} {...this.state} />
          </div>
        );
      }
    };
  }
  WithNav.displayName = `withNav(${getHOCComponentName(WrappedComponent)})`;

  return WithNav;
};

const withConfirm = WrappedComponent => {
  class WithConfirm extends React.Component {
    componentWillUnmount() {
      let leaveMessage = confirm(
        "Вы уверены, что не хотите подписаться на наши новости?"
      );
      alert(leaveMessage);
    }
    render() {
      return <WrappedComponent {...this.props} {...this.state} />;
    }
  }

  WithConfirm.displayName = `withConfirm(${getHOCComponentName(
    WrappedComponent
  )})`;

  return WithConfirm;
};

const HomePageWithNav = withNav(Homepage);
const ArticleWithConfirm = withConfirm(Article);
