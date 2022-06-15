import React, { useState } from "react";
import { Row, Col } from "react-bootstrap";

import HomeworkBuilderContext from "../components/homework/HomeworkBuilderContext";
import HomeworkBuilderPanel from "../components/homework/HomeworkBuilderPanel";
import Page from "../components/common/Page";
import { CourseHierarchy } from "../components/courses/CourseHierarchy";
import { TaskList } from "../components/tasks/TaskList";

function Courses() {
    const [selectedCourse, setSelectedCourse] = useState(undefined);

    return (
        <Page name="База знаний">
            <HomeworkBuilderContext>
                <Row style={{ height: "100%" }}>
                    <Col md={5}>
                        <CourseHierarchy onCourseSelect={setSelectedCourse} />
                    </Col>
                    <Col md={7}>
                        <HomeworkBuilderPanel />
                        <TaskList selectedCourse={selectedCourse} />
                    </Col>
                </Row>
            </HomeworkBuilderContext>
        </Page>
    );
}

export default Courses;
