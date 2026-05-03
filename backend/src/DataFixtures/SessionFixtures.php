<?php

// Namespace du fichier de fixtures.
namespace App\DataFixtures;

// Entités utilisées pour créer des sessions et des jeux.
use App\Entity\Game;
use App\Entity\Session;
use App\Entity\User;

// Classe de base des fixtures Doctrine.
use Doctrine\Bundle\FixturesBundle\Fixture;

// Interface permettant de déclarer une dépendance entre fixtures.
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

// ObjectManager permet d'enregistrer les objets en base.
use Doctrine\Persistence\ObjectManager;

// Fixture permettant de créer des sessions de test.
// Elle dépend de UserFixtures, car chaque session doit avoir un créateur.
class SessionFixtures extends Fixture implements DependentFixtureInterface
{
    // Méthode appelée lors du chargement des fixtures.
    public function load(ObjectManager $manager): void
    {
        /** @var User $admin */
        // Récupère l'utilisateur admin créé dans UserFixtures.
        $admin = $this->getReference('user_admin', User::class);

        // Création de la session 1 : mots croisés uniquement.
        $session1 = new Session();

        // Titre visible de la session.
        $session1->setTitreSession('Mots Croisés Cosmétiques');

        // Code que les joueurs peuvent utiliser pour rejoindre la session.
        $session1->setCodeSession('SESS01');

        // Durée de la session en secondes : 900 secondes = 15 minutes.
        $session1->setDuree(900);

        // Définit l’admin comme créateur de la session.
        $session1->setCreateur($admin);

        // Création d’un jeu de type mots croisés.
        $game1 = new Game();
        $game1->setType(Game::TYPE_CROSSWORD);

        // Lie le jeu à la session.
        $game1->setSession($session1);

        // Ajoute le jeu dans la collection de jeux de la session.
        $session1->addGame($game1);

        // Prépare l'enregistrement de la session et du jeu.
        $manager->persist($session1);
        $manager->persist($game1);

        // Ajoute une référence pour que d'autres fixtures puissent retrouver cette session.
        $this->addReference('session_1', $session1);

        // Session 2 non créée ici.
        // Le commentaire indique probablement qu'elle avait été prévue mais pas encore implémentée.

        // Création de la session 3 : formulation uniquement.
        $session3 = new Session();
        $session3->setTitreSession('Formulation de Produits');
        $session3->setCodeSession('SESS03');

        // Durée de la session en secondes : 1200 secondes = 20 minutes.
        $session3->setDuree(1200);

        // L'admin est aussi créateur de cette session.
        $session3->setCreateur($admin);

        // Création d'un jeu de type formulation.
        $game3 = new Game();
        $game3->setType(Game::TYPE_FORMULATION);

        // Lie le jeu à la session.
        $game3->setSession($session3);

        // Ajoute le jeu à la session.
        $session3->addGame($game3);

        // Prépare l'enregistrement de la session et du jeu.
        $manager->persist($session3);
        $manager->persist($game3);

        // Ajoute une référence pour les autres fixtures.
        $this->addReference('session_3', $session3);

        // Session 4 non créée ici.
        // Le commentaire indique une session complète prévue pour tester les 3 jeux.

        // Exécute toutes les insertions SQL préparées.
        $manager->flush();
    }

    // Indique que UserFixtures doit être exécuté avant cette fixture.
    public function getDependencies(): array
    {
        return [UserFixtures::class];
    }
}