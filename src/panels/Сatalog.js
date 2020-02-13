import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Button from '@vkontakte/vkui/dist/components/Button/Button';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import Switch from '@vkontakte/vkui/dist/components/Switch/Switch';
import PullToRefresh from '@vkontakte/vkui/dist/components/PullToRefresh/PullToRefresh';
import List from '@vkontakte/vkui/dist/components/List/List';
import connect from "@vkontakte/vk-connect";
import {getTable} from "../api";
import ScreenSpinner from "@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner";
import FixedLayout from "@vkontakte/vkui/dist/components/FixedLayout/FixedLayout";

const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}


const Catalog = (props) => {

    const {id, setPopout, userArr, lang, checkMessage, isMessagesFromGroupAllowed, setcheckMessage} = props
    const [fetching, setFetching] = useState(false)
    const getUser = (userID) => {
        connect.send("VKWebAppCallAPIMethod", {
            "method": "users.get",
            "request_id": "getUsers",
            "params": {
                "user_ids": userID,
                "v": "5.103",
                "fields": 'photo_50',
                "access_token": '85685eaa85685eaa85685eaa2d8504b3b58856885685eaad8e8ae5c720f4db08e7e9ee0',
                'lang' : lang
            }
        });
    }

    useEffect(() => {
        setPopout(<ScreenSpinner size='large' />)
        getTable(getUser)
    }, []);



    useEffect(() => {
        if (props.fetchedUser) {
            isMessagesFromGroupAllowed()
        }
    }, [props.fetchedUser]);


    const people = []

    const onRefresh = () => {
        setFetching(true)

        setTimeout(() => {
            setFetching(false)
            // this.setState({
            // 	items: [this.getNewItem(), ...this.state.items],
            // 	fetching: false
            // });
        }, getRandomInt(600, 2000));
    }



    const sendAllowMessage = (e) => {
        if (e.currentTarget.checked) {
            setPopout(<ScreenSpinner size='large' />)
            connect.send("VKWebAppAllowMessagesFromGroup", {"group_id": 185650440, "key": "dBuBKe1kFcdemzB"});
        } else {
            setcheckMessage(false)
        }
    }

	return <Panel id={id}>
		<PanelHeader>Каталог художников</PanelHeader>
		<Group description="Вы будете получать только важные уведомления"
			   separator="show">
			<Cell asideContent={<Switch checked={checkMessage} onChange={sendAllowMessage}/>}>
				Push-уведомления
			</Cell>
		</Group>
		<PullToRefresh onRefresh={() => onRefresh()} isFetching={fetching}>
			<Group>
				<List>
                    {userArr.map((p, i) => <Cell key={i} target='_blank' href={`https://vk.com/id${p.id}`}
                                                 before={<Avatar src={p.photo_50}/>}
                    >{p.first_name} {p.last_name}</Cell>)}
				</List>
			</Group>
		</PullToRefresh>
        <FixedLayout vertical="bottom">
                <Button target='_blanck' className='button-fix' size="xl" href='https://vk.com/app5619682_-113161053#467432' > Попасть в каталог </Button>
        </FixedLayout>

	</Panel>

}


Catalog.propTypes = {
    id: PropTypes.string.isRequired,
    go: PropTypes.func.isRequired,
    fetchedUser: PropTypes.shape({
        photo_200: PropTypes.string,
        first_name: PropTypes.string,
        last_name: PropTypes.string,
        city: PropTypes.shape({
            title: PropTypes.string,
        }),
    }),
};

export default Catalog;
