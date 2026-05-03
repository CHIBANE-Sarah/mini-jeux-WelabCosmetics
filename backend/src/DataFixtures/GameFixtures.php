<?php

// Namespace du fichier de fixtures.
namespace App\DataFixtures;

// Entité Game utilisée pour créer des jeux de test.
use App\Entity\Game;

// Entité Session utilisée pour récupérer une session existante.
use App\Entity\Session;

// Classe de base des fixtures Doctrine.
use Doctrine\Bundle\FixturesBundle\Fixture;

// Interface permettant d'indiquer que cette fixture dépend d'une autre fixture.
use Doctrine\Common\DataFixtures\DependentFixtureInterface;

// ObjectManager permet d'enregistrer les objets en base.
use Doctrine\Persistence\ObjectManager;

// Fixture permettant de créer des jeux de test.
// Elle dépend de SessionFixtures, car les jeux doivent être rattachés à une session existante.
class GameFixtures extends Fixture implements DependentFixtureInterface
{
    // Méthode appelée lors du chargement des fixtures.
    public function load(ObjectManager $manager): void
    {
        // Récupère la session_3 créée dans SessionFixtures.
        $session3 = $this->getReference('session_3', Session::class);

        // Création d’un jeu d’association.
        $gameAssociation = new Game();

        // Définit le type du jeu grâce à la constante de l'entité Game.
        $gameAssociation->setType(Game::TYPE_ASSOCIATION);

        // Lie ce jeu à la session 3.
        $gameAssociation->setSession($session3);

        // Prépare l'enregistrement du jeu en base.
        $manager->persist($gameAssociation);

        // Ajoute une référence pour pouvoir réutiliser ce jeu dans d'autres fixtures.
        $this->addReference('game_association_sess01', $gameAssociation);

        // Exécute l'insertion SQL.
        $manager->flush();
    }

    // Indique que cette fixture doit être chargée après SessionFixtures.
    public function getDependencies(): array
    {
        return [SessionFixtures::class];
    }
}