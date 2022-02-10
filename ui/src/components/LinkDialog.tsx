import { Modal } from 'antd';
import { cancelCardAction, CardAction } from '../lib/cardActions';


interface LinkDialogProps {
    action:CardAction|undefined;
}

export default function LinkDialog({action}:LinkDialogProps) {
    const handleCancel = ()=> {
        cancelCardAction(action!);
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