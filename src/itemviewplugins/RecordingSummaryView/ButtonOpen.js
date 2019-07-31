import React, { Component } from 'react';
import { Button, IconButton } from '@material-ui/core';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

class ButtonOpen extends Component {
    state = {
        isOpen: false
    }
    _toggle = () => {
        this.setState({isOpen: !this.state.isOpen});
    }
    render() { 
        const { isOpen } = this.state;
        if (!isOpen) {
            return (
                <h4><IconButton onClick={this._toggle}><FaChevronRight /></IconButton> {this.props.label}</h4>
            )
        }
        else {
            return (
                <React.Fragment>
                    <h4><IconButton onClick={this._toggle}><FaChevronDown /></IconButton> {this.props.label}</h4>
                    <React.Fragment>
                        {this.props.children}
                    </React.Fragment>
                </React.Fragment>
            )
        }
    }
}
 
export default ButtonOpen;