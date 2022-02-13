import { Modal } from 'antd';
import { cancelCardAction, CardAction } from '../lib/cardActions';


interface CardInfoDialogProps {
    action:CardAction|undefined;
    onComplete?:()=>void
}

export default function CardInfoDialog({action,onComplete}:CardInfoDialogProps) {
    const handleCancel = ()=> {
        cancelCardAction(action!);
        onComplete && onComplete();
    }
    const loadDone = action && action.tappedCard;
    const record = action?.tappedCard;
    return (
    <>
        <Modal
            visible={action !== undefined}
            title="Ready to Link"
            onCancel={handleCancel}
            onOk={handleCancel}
            centered
            okButtonProps={{loading:!loadDone, disabled:!loadDone}}
            okText="OK"
            closable={false}
        >
            <div>
            {
                loadDone? 
                (record?.content) === undefined?
                (
                    <>
                        <p>{record?.id}</p>
                        <p>This card is not linked to any music.</p>
                    </>
                ):
                    (<>
                        <img src={record?.content.cover} width={100} alt=""/>
                        <h1>{record?.content.title}</h1>
                        <p>{record?.content.details.type}</p>
                        <p>{record?.id}</p>
                    </>
                
                ):
                    <p>Tap a card on tappy to find out all about it.</p>
            }
            </div>
        </Modal>
    </>
  )
}