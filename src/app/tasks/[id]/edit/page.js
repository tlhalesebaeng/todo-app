'use client';

import Button from '@/components/button/Button';
import LabeledInput from '@/components/input/LabeledInput';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditTask({ params }) {
    const [data, setData] = useState(null);
    const [topics, setTopics] = useState(null);
    const [statuses, setStatuses] = useState(null);
    const [task, setTask] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // We can await all these promises at the same time but I choose simplicity :)
                const { id } = await params;
                const taskResponse = await fetch(`/api/tasks/${id}`);
                const topicsResponse = await fetch('/api/topics');
                const statusesResponse = await fetch('/api/statuses');

                const fetchedTopics = await topicsResponse.json();
                const fetchedTask = await taskResponse.json();
                const fetchedStatuses = await statusesResponse.json();

                setTopics(fetchedTopics);
                setStatuses(fetchedStatuses);
                setTask(fetchedTask);
                setData(fetchedTask);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };

        fetchData();
    }, []);

    if (isLoading) return <p>Loading...</p>;

    const onChange = (field, value) => {
        setError('');
        setData((prevState) => ({ ...prevState, [field]: value }));
    };

    const onSave = async (event) => {
        event.preventDefault();

        // Include only the changed data in the request body
        const requestData = {};
        if (data.title !== task.title) requestData.title = data.title;
        if (data.description !== task.description) requestData.description = data.description;
        if (data.dueDate !== task.dueDate) requestData.dueDate = data.dueDate;
        if (data.archived !== task.archived) requestData.archived = data.archived;
        if (data.topicId !== task.topic.id) requestData.topicId = data.topicId;
        if (data.statusId !== task.status.id) requestData.statusId = data.statusId;

        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const taskDetails = await response.json();
                setTask(taskDetails);
            }
        } catch (error) {
            console.log(error);
            setError(error.message || 'Something went wrong! Please try again later');
        }
    };

    const onNewTopic = (event) => {
        event.preventDefault();
        router.push('/topics');
    };

    const onChangeArchive = async (event) => {
        event.preventDefault();

        try {
            const requestData = { archived: !data.archived };
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const taskDetails = await response.json();
                onChange('archived', !data.archived);
                setTask(taskDetails);
            }
        } catch (error) {
            console.log(error);
            setError(error.message || 'Something went wrong! Please try again later');
        }
    };

    return (
        <main>
            <h1>Edit Task</h1>
            <h2>{data.title}</h2>
            <form>
                <LabeledInput
                    labelText="Title"
                    type="text"
                    onChange={(event) => onChange('title', event.target.value)}
                    value={data.title}
                />
                <LabeledInput
                    labelText="Due Date"
                    type="date"
                    onChange={(event) => onChange('dueDate', event.target.value)}
                    value={data.dueDate.slice(0, 10)}
                />
                <section>
                    <select
                        name="topics"
                        onChange={(event) => onChange('topicId', event.target.selectedIndex)}
                        defaultValue={data.topic.name}
                    >
                        <option value="fixed-option">Please choose a topic</option>
                        {topics.map(({ name, id }) => (
                            <option key={id} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <Button onClick={(event) => onNewTopic(event)}>New Topic</Button>
                </section>
                <section>
                    <select
                        name="statuses"
                        onChange={(event) => onChange('statusId', event.target.selectedIndex)}
                        defaultValue={data.status.name}
                    >
                        <option value="fixed-option">Please choose a status</option>
                        {statuses.map(({ name, id }) => (
                            <option key={id} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <Button onClick={(event) => onChangeArchive(event)}>
                        {data.archived ? 'Unarchive' : 'Archive'}
                    </Button>
                </section>
                <LabeledInput
                    labelText="Description"
                    type="text"
                    onChange={(event) => onChange('description', event.target.value)}
                    value={data.description}
                />
                {error && <p>{error}</p>}
                <Button onClick={(event) => onSave(event)}>Save</Button>
            </form>
        </main>
    );
}
