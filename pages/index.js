import Head from 'next/head'

export default function Home() {
	return (
		<div
			style={{
				display: 'flex',
				height: '100vh',
				padding: '2em',
				flexDirection: 'column',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<Head>
				<title>Juju 2 Fruits</title>
				<meta
					name='description'
					content='Back Office pour la gestion des commandes Juju 2 Fruits'
				/>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div>
				<h1>When life gives you lemons...</h1>
			</div>
			<footer>Sell &apos;em to lemonade makers !</footer>
		</div>
	)
}
