'use client';

import Button from '@/components/button/Button';
import LabeledInput from '@/components/input/LabeledInput';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Tasks() {
    const [data, setData] = useState({ title: '', description: '', dueDate: '', topicId: '' });
    const [topics, setTopics] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchTopics = async () => {
            try {
                const response = await fetch('/api/topics');
                const fetchedTopics = await response.json();
                setTopics(fetchedTopics);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        };
        fetchTopics();
    }, []);

    if (isLoading) return <p>Loading...</p>;

    const onChange = (field, value) => {
        setError('');
        setData((prevState) => ({ ...prevState, [field]: value }));
    };

    const onCreate = async (event) => {
        event.preventDefault();

        if (!data.title || !data.description || !data.dueDate || !data.topicId) {
            return setError('All fields are required! Please fill in all fields');
        }

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response) {
                const taskDetails = await response.json();
                router.push(`/tasks/${taskDetails.id}`);
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

    return (
        <main>
            <h1>Create New Task</h1>
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
                    <select name="topics" onChange={(event) => onChange('topicId', event.target.selectedIndex - 1)}>
                        <option value="fixed-option">Please choose a topic</option>
                        {topics.map(({ name, id }) => (
                            <option key={id} value={name}>
                                {name}
                            </option>
                        ))}
                    </select>
                    <Button onClick={(event) => onNewTopic(event)}>New Topic</Button>
                </section>
                <LabeledInput
                    labelText="Description"
                    type="text"
                    onChange={(event) => onChange('description', event.target.value)}
                    value={data.description}
                />
                {error && <p>{error}</p>}
                <Button onClick={(event) => onCreate(event)}>Create</Button>
            </form>
        </main>
    );
}
