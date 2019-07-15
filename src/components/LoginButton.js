import React, { useContext, useEffect, useState } from "react";
import Button from "./Button";
import Context from "./Context";

const LoginButton = () => {
  const [{ loggedIn, jsforce }, dispatch] = useContext(Context);
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    setRendered(true);
  }, []);

  if (loggedIn || !rendered) return null;
  return (
    <Button
      variant="warning"
      onClick={e => {
        window.onunload = () => {
          localStorage.removeItem("local_user");
          jsforce.browser.logout();
        };
        jsforce.browser.login(
          {
            loginUrl: window.loginUrl,
            popup: { width: 912, height: 600 }
          },
          function(err) {
            if (err) {
              return dispatch(
                {
                  type: "TOAST/error",
                  payload: {
                    name: err.name,
                    timeStamp: Date.now(),
                    message: err.message
                  }
                },
                2000
              );
            }
            jsforce.browser.connection
              .identity()
              .then(payload => {
                dispatch({ type: "loggedin", payload });
                dispatch(
                  {
                    type: "TOAST/success",
                    payload: {
                      timeStamp: Date.now(),
                      name: "Successfully Logged in",
                      message: "You have been logged in"
                    }
                  },
                  3000
                );
                localStorage.setItem("local_user", JSON.stringify(payload));
              })
              // eslint-disable-next-line no-console
              .catch(console.error);
          }
        );
      }}
    >
      Login
    </Button>
  );
};

export default LoginButton;
