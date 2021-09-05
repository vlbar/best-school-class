import React, { useState } from 'react'
import { Row, Col, Container } from 'react-bootstrap'
import { CourseHierarchy } from '../components/courses/CourseHierarchy'
import usePageTitle from '../components/feedback/usePageTitle'
import HomeworkBuilderContext from '../components/homework/HomeworkBuilderContext'
import HomeworkBuilderPanel from '../components/homework/HomeworkBuilderPanel'
import { TaskList } from '../components/tasks/TaskList'

function Courses() {
    const [selectedCourse, setSelectedCourse] = useState(undefined)
    usePageTitle({title: 'Курсы'})

    return (
        <Container>
            <HomeworkBuilderContext>
                <HomeworkBuilderPanel/>

                <Row style={{height: '100%'}}>
                    <Col md={6}>
                        <h4>База знаний</h4>
                        <CourseHierarchy onCourseSelect={setSelectedCourse}/>
                    </Col>

                    <Col md={6}>
                        <h4>Задания</h4>
                        <TaskList selectedCourse={selectedCourse}/>
                    </Col>
                </Row>
            </HomeworkBuilderContext>
        </Container>
    )
}

export default Courses