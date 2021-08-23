import React from "react";
import "./GroupMemberList.less";
import { Col, Row } from "react-bootstrap";
import {
  ASSISTANT,
  STUDENT,
  TEACHER,
} from "../../../../redux/state/stateActions";

import MemberContainer from "./MemberContainer";
import { GroupContext } from "../../../../pages/Group";
import { useContext } from "react";
import ModalTrigger from "../../../common/ModalTrigger";
import MemberSettingsModal from "./MemberSettingsModal";

function GroupMemberList({ internalState = null }) {
  const { group, creator, member, onGroupEdit } = useContext(GroupContext);

  function wrapContainerWithModalTrigger(container) {
    return (
      <ModalTrigger
        modal={<MemberSettingsModal group={group} onGroupEdit={onGroupEdit} />}
        openTriggerProp="onSettingsCall"
      >
        {container}
      </ModalTrigger>
    );
  }

  return (
    <Row>
      <Col md={6}>
        {wrapContainerWithModalTrigger(
          <MemberContainer
            title="Преподавательский состав"
            membersLink={group.link("groupMembers")}
            invitesLink={group.link("groupInvites")}
            isCreator={creator.id === member.user.id}
            currentUser={member.user}
            roles={[TEACHER, ASSISTANT]}
            withInvites={creator.id === member.user.id}
            internalState={internalState}
            closed={group.closed}
          />
        )}
      </Col>
      <Col md={6}>
        {wrapContainerWithModalTrigger(
          <MemberContainer
            title="Ученики"
            membersLink={group.link("groupMembers")}
            invitesLink={group.link("groupInvites")}
            isCreator={creator.id === member.user.id}
            currentUser={member.user}
            roles={[STUDENT]}
            withInvites={creator.id === member.user.id}
            internalState={internalState}
            withLimit={group.studentsLimit}
            closed={group.closed}
          />
        )}
      </Col>
    </Row>
  );
}

export default GroupMemberList;
