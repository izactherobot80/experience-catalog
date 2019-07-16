import React from "react";
import "./modal.scss";
import Modal from "./Modal";

const ModalWrapper = ({ active, activate, children }) => (
  <Modal activate={activate} className={active ? "overlay active" : "overlay"}>
    {active ? children : null}
  </Modal>
);

export default ModalWrapper;