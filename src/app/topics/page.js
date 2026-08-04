'use client';

import Button from '@/components/button/Button';
import LabeledInput from '@/components/input/LabeledInput';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Topics() {
    const [data, setData] = useState({ name: '' });
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

    const onCreate = async (event) => {
        event.preventDefault();

        // TODO: Confirm that the data is
        if (!data.name) {
            return setError('Topic required! Please fill in the topic field');
        }

        try {
            const response = await fetch('/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response && response.status === 201) {
                const topicDetails = await response.json();
                router.back();
            }
        } catch (error) {
            console.log(error);
            setError(error.message || 'Something went wrong! Please try again later');
        }
    };

    const onChange = (field, value) => {
        setError('');
        setData((prevState) => ({ ...prevState, [field]: value }));
    };

    if (isLoading) return <p>Loading...</p>;

    return (
        <section>
            <h1>Create New Topic</h1>
            <p>Please enter the name of the topic to create a new one. Topics help you to sort and organize tasks</p>
            <form>
                <LabeledInput
                    labelText="Topic"
                    type="text"
                    onChange={(event) => onChange('name', event.target.value)}
                />
                {error && <p>{error}</p>}
                <Button onClick={(event) => onCreate(event)}>Create</Button>
            </form>
            <h2>Available Topics</h2>
            <ul>
                {topics.map(({ id, name }) => (
                    <li key={id}>{name}</li>
                ))}
            </ul>
        </section>
    );
}
