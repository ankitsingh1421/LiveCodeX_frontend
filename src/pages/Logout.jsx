import React, { useEffect } from 'react'
import { useHistory } from 'react-router';
import { apiUrl } from '../api';

const Logout = (props) => {


    const history = useHistory();
    useEffect(()=>{
        fetch(apiUrl('/logout'), {
            method: "GET",
            headers: {
                Accept: 'application/json',
                "Content-Type": "application/json"
            },
            credentials: "include"
        }).then((res)=>{
            props.setIsLogout("1");
            history.push('/');
            if (res.status !== 200) {
                const err = new Error(res.error);
                throw err;
            }
        }).catch((err)=>{
            console.log(err)
        })
    });

    return (
        <div>
            <h1>
                Logout
            </h1>
        </div>
    )
}

export default Logout
