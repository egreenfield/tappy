import Layout from '../components/layout'
import { getSession, useSession, signIn, signOut } from "next-auth/react"
import {getUsersPlaylists} from '../lib/server/spotify';
import { Table, Space, Button, Modal } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useEffect, useState } from 'react';
import { cancelCardAction, CardAction } from '../lib/client/cardActions';


interface LinkDialogProps {
    action:CardAction;
}

export default function LinkDialog({action}:LinkDialogProps) {
    const handleCancel = ()=> {
        cancelCardAction(action);
    }
    
    return (
    <>
       <Modal
            visible={action && action.complete == false}
            title="Ready to Link"
            onCancel={handleCancel}
            centered
            okButtonProps={{loading:true, disabled:true}}
            cancelButtonProps={{type:"primary"}}
            okText=" "
            closable={false}
        >
            <div>
            <p>Tap a card on tappy to link it to this playlist.</p>
            </div>
        </Modal>
    </>
  )
}